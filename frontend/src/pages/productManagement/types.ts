import { ProductCustomization, Metal, Gemstone } from "@/types";

// Shared interfaces used across multiple components
export interface ProductFormData {
  name: string;
  price: string | number;
  category: string;
  description: string;
  inStock: boolean;
  stock_quantity: string;
  size: string;
  certification: string;
}

export interface ProductManagementProps {
  isEdit?: boolean;
  productId?: string;
}

export interface ProductData {
  name: string;
  price: number;
  category_id: number;
  description: string;
  is_active: boolean;
  stock_quantity: number;
  metals: Omit<Metal, 'id'>[];
  gemstones: Omit<Gemstone, 'id'>[];
  customizations: ProductCustomization[];
}