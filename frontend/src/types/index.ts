export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  children?: Category[];
  created_at: string;
}

export interface ProductCustomization {
  id: string;
  name: string;
  type: 'select' | 'range' | 'text';
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  required: boolean;
  default_value?: string | number;
}

export interface Metal {
  id?: string;
  type: string; // e.g., "Gold", "Silver", "Platinum"
  purity: string; // e.g., "18k", "14k", "925"
  weight: number; // in grams
  color?: string; // e.g., "White", "Yellow", "Rose"
  percentage?: number; // percentage of total weight
}

export interface Gemstone {
  id?: string;
  type: string; // e.g., "Diamond", "Ruby", "Emerald"
  cut?: string; // e.g., "Round", "Princess", "Emerald"
  carat: number; // carat weight
  color?: string; // e.g., "D", "E", "F" for diamonds
  clarity?: string; // e.g., "FL", "IF", "VVS1"
  count: number; // number of stones of this type
  shape?: string; // e.g., "Round", "Oval", "Pear"
  setting?: string; // e.g., "Prong", "Bezel", "Channel"
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  category?: Category;
  stock_quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  metals?: Metal[];
  gemstones?: Gemstone[];
  is_active: boolean;
  model_3d_url?: string;
  images: ProductImage[];
  customizations?: ProductCustomization[];
  created_at: string;
  // material?: string;
  // gemstone?: string;
  // metal_type?: string;
  // metal_purity?: string;
  // featured: boolean;
  // updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Cart {
  id: number;
  user_id?: number;
  session_id?: string;
  items: CartItem[];
  total_amount: number;
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  type: 'shipping' | 'billing';
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  product_name: string;
  product_sku?: string;
  customizations?: Record<string, string | number>;
  created_at: string;
}

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
