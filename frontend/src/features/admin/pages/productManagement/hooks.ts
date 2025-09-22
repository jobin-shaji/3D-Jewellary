import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { Product} from "@/shared/types";
// import { ProductData } from "./types";

interface FileUploadState {
    model3DFile: File | null;
    imageFiles: File[];
    model3DPreview: string;
    imagePreviews: string[];
}

// API Operations
export const createProduct = async (Product: Product): Promise<any> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const response = await fetch('http://localhost:3000/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(Product),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create product');
  }

  return response.json();
};

export const updateProduct = async (productId: string, Product: Product): Promise<any> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(Product),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update product');
  }

  return response.json();
};

export const uploadProductImages = async (productId: number, imageFiles: File[]): Promise<any> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const imageFormData = new FormData();
  imageFiles.forEach((file) => {
    imageFormData.append('images', file);
  });

  const response = await fetch(`http://localhost:3000/api/products/${productId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: imageFormData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload images');
  }

  return response.json();
};

export const upload3DModel = async (productId: number, model3DFile: File): Promise<any> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const modelFormData = new FormData();
  modelFormData.append('model', model3DFile);

  const response = await fetch(`http://localhost:3000/api/products/${productId}/model`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: modelFormData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload 3D model');
  }

  return response.json();
};

export const uploadCertificates = async (productId: number, certificates: Array<{name: string, file: File}>): Promise<any> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token not found.');
  }

  const certificateFormData = new FormData();
  
  // Append certificate files and names in the expected format
  certificates.forEach((cert, index) => {
    certificateFormData.append('certificates', cert.file);
    certificateFormData.append(`certificates[${index}][name]`, cert.name);
  });

  const response = await fetch(`http://localhost:3000/api/products/${productId}/certificates`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: certificateFormData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload certificates');
  }

  return response.json();
};

export const fetchCategories = async (): Promise<Array<{id: number; name: string; description?: string;createdAt?: string}>> => {
  const response = await fetch('http://localhost:3000/api/categories');
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
};

// Wrapper functions with error handling and toast notifications
export const useProductSubmission = () => {
  const { toast } = useToast();

  const uploadImagesWithToast = async (productId: number, imageFiles: File[], isUpdate = false) => {
    if (imageFiles.length === 0) return null;

    try {
      console.log('Uploading images for product:', productId);
      const imageData = await uploadProductImages(productId, imageFiles);
      console.log('✅ Images uploaded successfully:', imageData);
      
      toast({
        title: "Images Uploaded",
        description: `${imageData.images.length} images uploaded successfully.`,
      });
      
      return imageData;
    } catch (imageError) {
      console.error('❌ Image upload error:', imageError);
      toast({
        title: "Warning", 
        description: `Product ${isUpdate ? 'updated' : 'created'} but image upload failed.`,
        variant: "destructive",
      });
      throw imageError;
    }
  };

  const upload3DModelWithToast = async (productId: number, model3DFile: File, isUpdate = false) => {
    if (!model3DFile) return null;

    try {
      console.log('📦 Uploading 3D model for product:', productId);
      const modelData = await upload3DModel(productId, model3DFile);
      console.log('✅ 3D model uploaded successfully:', modelData);
      
      toast({
        title: "3D Model Uploaded",
        description: "3D model uploaded successfully.",
      });
      
      return modelData;
    } catch (modelError) {
      console.error('❌ 3D model upload error:', modelError);
      toast({
        title: "Warning",
        description: `Product ${isUpdate ? 'updated' : 'created'} but 3D model upload failed.`,
        variant: "destructive",
      });
      throw modelError;
    }
  };

  const uploadCertificatesWithToast = async (productId: number, certificates: Array<{name: string, file: File}>, isUpdate = false) => {
    if (certificates.length === 0) return null;

    try {
      console.log('📄 Uploading certificates for product:', productId);
      const uploadedCertificates = await uploadCertificates(productId, certificates);
      console.log('✅ Certificates uploaded successfully:', uploadedCertificates);
      
      toast({
        title: "Certificates Uploaded",
        description: `${certificates.length} certificate(s) uploaded successfully.`,
      });
      
      return uploadedCertificates;
    } catch (certificateError) {
      console.error('❌ Certificate upload error:', certificateError);
      toast({
        title: "Warning",
        description: `Product ${isUpdate ? 'updated' : 'created'} but certificate upload failed.`,
        variant: "destructive",
      });
      throw certificateError;
    }
  };

  return {
    uploadImagesWithToast,
    upload3DModelWithToast,
    uploadCertificatesWithToast,
  };
};

export const useFileUpload = () => {
  const { toast } = useToast();
  
  const [fileState, setFileState] = useState<FileUploadState>({
    model3DFile: null,
    imageFiles: [],
    model3DPreview: "",
    imagePreviews: [],
  });

  const handle3DModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "3D model files must be under 50MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['.glb', '.gltf', '.obj', '.fbx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a .glb, .gltf, .obj, or .fbx file.",
          variant: "destructive",
        });
        return;
      }

      setFileState(prev => ({
        ...prev,
        model3DFile: file,
        model3DPreview: file.name
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each file
    const validFiles: File[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (const file of files) {
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Images must be under 5MB.`,
          variant: "destructive",
        });
        continue;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive",
        });
        continue;
      }
      
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setFileState(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...validFiles]
    }));

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileState(prev => ({
          ...prev,
          imagePreviews: [...prev.imagePreviews, e.target?.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFileState(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const remove3DModel = () => {
    setFileState(prev => ({
      ...prev,
      model3DFile: null,
      model3DPreview: ""
    }));
  };

  return {
    fileState,
    handle3DModelUpload,
    handleImageUpload,
    removeImage,
    remove3DModel
  };
};