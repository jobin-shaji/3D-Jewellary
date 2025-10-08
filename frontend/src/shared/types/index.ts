export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  // isVerified: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

// export interface ProductCustomization {
//   id?: string;
//   name: string;
//   type: 'select' | 'range' | 'text';
//   options?: string[];
//   min?: number;
//   max?: number;
//   unit?: string;
//   required: boolean;
//   default_value?: string | number;
// }

export interface ProductVariant {
  variant_id?: string;
  name: string;
  stock_quantity: number;
  making_price: number;
  metal: Metal[];
  totalPrice?: number;
}

export interface Metal {
  id?: string;
  type: string; 
  purity: string;
  weight: number;
  color?: string;
}

export interface Gemstone {
  id?: string;
  type: string; 
  carat: number; 
  color?: string;
  clarity?: string; 
  count: number;
  shape?: string;
  price: number; // Price per carat or total price
}

export interface Certificate {
  name: string;
  file_url: string;
}

export interface ProductImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  makingPrice: number;
  category_id: number;
  category?: Category;
  stock_quantity: number;
  metals?: Metal[];
  gemstones?: Gemstone[];
  variants?: ProductVariant[];
  // customizations?: ProductCustomization[];
  images?: ProductImage[];
  primaryImage?: ProductImage;
  model_3d_url?: string;
  certificates?: Certificate[];
  is_active: boolean;
  created_at?: string;
  totalPrice?: number;
  latestPriceUpdate?: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  variant_id?: string;
  name: string;
  totalprice: number;
  quantity: number;
  image?: {
    image_url: string;
    alt_text: string;
  };
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // For any extra backend fields (like summary, etc.)
}

// export interface OrderItem {
//   id: number;
//   order_id: number;
//   product_id: number;
//   product: Product;
//   quantity: number;
//   price: number;
//   product_name: string;
//   product_sku?: string;
//   customizations?: Record<string, string | number>;
//   created_at: string;
// }

// export interface Order {
//   id: number;
//   user_id: number;
//   order_number: string;
//   status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
//   total_amount: number;
//   tax_amount: number;
//   shipping_amount: number;
//   shipping_address: Address;
//   billing_address: Address;
//   payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
//   payment_method?: string;
//   payment_id?: string;
//   notes?: string;
//   items: OrderItem[];
//   created_at: string;
//   updated_at: string;
// }