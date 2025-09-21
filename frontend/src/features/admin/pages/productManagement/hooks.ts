import { useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { Product,Metal, Gemstone, ProductCustomization } from "@/shared/types";
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