import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:3000/api";

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isVerified?: boolean;
  createdAt?: string;
  googleId?: string;
  profilePicture?: string;
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
}

// Auth response interface
export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// Auth status interface
export interface AuthStatus {
  isLoggedIn: boolean;
  user: User | null;
}

// Token management
const TOKEN_KEY = 'auth_token';

const getToken = (): string | null =>{
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  // Set default authorization header for all future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

// Initialize axios with token if it exists
const initializeAuth = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Initialize on module load
initializeAuth();

// Auth service functions
const authService = {
  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    
    // Store token and user data
    if (response.data.token) {
      setToken(response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Register user
  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/register`, userData);
    
    // Store token and user data
    if (response.data.token) {
      setToken(response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional with JWT)
      await axios.post(`${API_URL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and user data
      removeToken();
      localStorage.removeItem("user");
    }
  },

  // Check auth status
  async checkAuthStatus(): Promise<AuthStatus> {
    try {
      const token = getToken();
      if (!token) {
        return { isLoggedIn: false, user: null };
      }

      const response = await axios.get(`${API_URL}/auth-status`);
      
      // Update local storage with current user data
      if (response.data.isLoggedIn && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        localStorage.removeItem("user");
      }
      
      return response.data;
    } catch (error) {
      console.error('Auth check error:', error);
      // Token might be expired or invalid
      removeToken();
      localStorage.removeItem("user");
      return { isLoggedIn: false, user: null };
    }
  },

  // Get user from local storage
  getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from storage:', error);
      localStorage.removeItem("user");
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!(getToken() && this.getUserFromStorage());
  },

  // Google OAuth login/register
  async googleAuth(googleToken: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/auth/google`, {
      token: googleToken,
    });

    // Store token and user data
    if (response.data.token) {
      setToken(response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  }
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const authStatus: AuthStatus = await authService.checkAuthStatus();
      setIsLoggedIn(authStatus.isLoggedIn);
      setUser(authStatus.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
      throw error; // Re-throw to handle in component
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
      throw error; // Re-throw to handle in component
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const googleLogin = async (googleToken: string) => {
    try {
      const response = await authService.googleAuth(googleToken);
      setUser(response.user);
      setIsLoggedIn(true);
    } catch (error) {
      setUser(null);
      setIsLoggedIn(false);
      throw error; // Re-throw to handle in component
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
