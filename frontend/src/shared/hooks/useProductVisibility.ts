import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';
import { apiUrl } from '@/shared/lib/api';

interface ToggleVisibilityResult {
  success: boolean;
  newStatus: boolean;
  message: string;
}

export const useProductVisibility = () => {
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const toggleProductVisibility = async (
    productId: string, 
    productName: string, 
    currentStatus: boolean
  ): Promise<ToggleVisibilityResult> => {
    setIsLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(apiUrl(`/api/products/${productId}/toggle-active`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle product visibility');
      }

      const data = await response.json();
      const newStatus = data.product.is_active;

      toast({
        title: "Success",
        description: `${productName} has been ${newStatus ? 'made visible' : 'hidden'} in the store`,
        variant: "default",
      });

      return {
        success: true,
        newStatus: newStatus,
        message: data.message
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Error",
        description: `Failed to update ${productName} visibility: ${errorMessage}`,
        variant: "destructive",
      });

      return {
        success: false,
        newStatus: currentStatus, // Return original status on error
        message: errorMessage
      };

    } finally {
      setIsLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const isProductLoading = (productId: string): boolean => {
    return isLoading[productId] || false;
  };

  return {
    toggleProductVisibility,
    isProductLoading
  };
};