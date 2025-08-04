// API client for backend communication
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Merge with any additional headers
    const allHeaders = { ...headers, ...(options.headers as Record<string, string>) };

    const response = await fetch(url, {
      ...options,
      headers: allHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Product endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.request<{ products: any[]; total: number; page: number; limit: number }>(`/products${queryString}`);
  }

  async getProduct(id: number) {
    return this.request<{ product: any }>(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request<{ product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: any) {
    return this.request<{ product: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // Category endpoints
  async getCategories() {
    return this.request<{ categories: any[] }>('/categories');
  }

  // Cart endpoints
  async getCart() {
    return this.request<{ cart: any }>('/cart');
  }

  async addToCart(productId: number, quantity: number) {
    return this.request<{ cart_item: any }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request<{ cart_item: any }>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number) {
    return this.request(`/cart/items/${itemId}`, { method: 'DELETE' });
  }

  async clearCart() {
    return this.request('/cart', { method: 'DELETE' });
  }

  // Order endpoints
  async getOrders(page = 1, limit = 10) {
    return this.request<{ orders: any[]; total: number }>(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(id: number) {
    return this.request<{ order: any }>(`/orders/${id}`);
  }

  async createOrder(orderData: {
    shipping_address: any;
    billing_address: any;
    payment_method: string;
  }) {
    return this.request<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Payment endpoints
  async createPaymentIntent(orderId: number, amount: number) {
    return this.request<{ client_secret: string }>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, amount }),
    });
  }

  async confirmPayment(paymentIntentId: string, orderId: number) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId, order_id: orderId }),
    });
  }

  // User profile endpoints
  async getProfile() {
    return this.request<{ user: any }>('/user/profile');
  }

  async updateProfile(userData: any) {
    return this.request<{ user: any }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getAddresses() {
    return this.request<{ addresses: any[] }>('/user/addresses');
  }

  async addAddress(addressData: any) {
    return this.request<{ address: any }>('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: number, addressData: any) {
    return this.request<{ address: any }>(`/user/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: number) {
    return this.request(`/user/addresses/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;