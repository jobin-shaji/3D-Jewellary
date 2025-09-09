import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<any>;
  googleLogin: (token: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Auth Provider Init - Token check:', token ? 'Found' : 'Not found');
    
    if (token) {
      // Verify token with backend
      fetch('http://localhost:3000/api/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          // Token invalid, remove it
          console.log('❌ Token invalid, removing...');
          localStorage.removeItem('token');
          throw new Error('Invalid token');
        }
      })
      .then(data => {
        console.log('✅ Token verified, user:', data.user);
        setUser(data.user);
        setIsLoggedIn(true);
      })
      .catch(error => {
        console.error('❌ Token verification failed:', error);
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('token');
      });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔄 Attempting login for:', email);
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful, data received:', data);
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      console.log('💾 Token saved to localStorage:', data.token ? 'Yes' : 'No');
      
      // Update user state
      setUser(data.user);
      setIsLoggedIn(true);
      console.log('👤 User state updated:', data.user);
      
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      console.log('🔄 Attempting Google login...');
      const response = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Google login failed');
      }

      const data = await response.json();
      console.log('✅ Google login successful, data received:', data);
      
      // Save token to localStorage
      localStorage.setItem('token', data.token);
      console.log('💾 Token saved to localStorage:', data.token ? 'Yes' : 'No');
      
      // Update user state
      setUser(data.user);
      setIsLoggedIn(true);
      console.log('👤 User state updated:', data.user);
      
      return data;
    } catch (error) {
      console.error('❌ Google login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔄 Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    console.log('✅ Logged out successfully');
  };

  const value = {
    user,
    isLoggedIn,
    login,
    googleLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
