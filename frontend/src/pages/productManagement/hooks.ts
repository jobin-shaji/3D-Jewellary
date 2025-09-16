import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
interface FileUploadState {
    model3DFile: File | null;
    imageFiles: File[];
    model3DPreview: string;
    imagePreviews: string[];
}

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