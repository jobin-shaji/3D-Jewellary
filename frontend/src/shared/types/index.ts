export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  // isVerified: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface ProductCustomization {
  id?: string;
  name: string;
  type: 'select' | 'range' | 'text';
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  required: boolean;
  default_value?: string | number;
}

export interface VariantMetal {
  Type: string; // e.g., "Gold", "Silver", "Platinum"
  purity: string; // e.g., "18k", "14k", "925"
  weight: number; // in grams
}

export interface ProductVariant {
  variant_id: string;
  name: string;
  stock_quantity: number;
  making_price: number;
  metal: VariantMetal[];
  totalPrice: number;
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
  customizations?: ProductCustomization[];
  images?: ProductImage[];
  primaryImage?: ProductImage;
  model_3d_url?: string;
  certificates?: Certificate[];
  is_active: boolean;
  created_at?: string;
  totalPrice?: number;
  latestPriceUpdate?: string;
}

// export interface CartItem {
//   id: number;
//   cart_id: number;
//   product_id: number;
//   product: Product;
//   quantity: number;
//   price: number;
//   created_at: string;
// }

// export interface Cart {
//   id: number;
//   user_id?: number;
//   session_id?: string;
//   items: CartItem[];
//   total_amount: number;
//   total_items: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface Address {
//   id: number;
//   user_id: number;
//   type: 'shipping' | 'billing';
//   first_name: string;
//   last_name: string;
//   company?: string;
//   address_line_1: string;
//   address_line_2?: string;
//   city: string;
//   state: string;
//   postal_code: string;
//   country: string;
//   phone?: string;
//   is_default: boolean;
//   created_at: string;
// }

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
