import { ProductFormData, ProductData } from "./types.ts";
import { Metal, Gemstone, ProductCustomization } from "@/types";

export const validateProductForm = (formData: ProductFormData): string | null => {
  if (!formData.name.trim()) {
    return "Product name is required.";
  }

  if (!formData.category) {
    return "Please select a category.";
  }

  if (!formData.price || Number(formData.price) <= 0) {
    return "Please enter a valid price greater than 0.";
  }

  if (!formData.description.trim()) {
    return "Product description is required.";
  }

  return null;
};

export const createProductData = (
  formData: ProductFormData,
  metals: Metal[],
  gemstones: Gemstone[],
  customizations: ProductCustomization[]
): ProductData => {
  return {
    name: formData.name,
    price: Number(formData.price),
    category_id: Number(formData.category),
    description: formData.description,
    is_active: formData.inStock,
    stock_quantity: Number(formData.stock_quantity || 0),
    metals: metals.map(({ id, ...metal }) => metal), // Remove frontend-only id
    gemstones: gemstones.map(({ id, ...gemstone }) => gemstone), // Remove frontend-only id
    customizations: customizations,
  };
};

export const createProduct = async (productData: ProductData): Promise<any> => {
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
    body: JSON.stringify(productData),
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

export const fetchCategories = async (): Promise<Array<{id: number; name: string; description?: string}>> => {
  const response = await fetch('http://localhost:3000/api/categories');
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  return response.json();
};