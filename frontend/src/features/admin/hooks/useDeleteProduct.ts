import { useState } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

export const useDeleteProduct = () => {
  const { toast } = useToast();
  const [deleteAttempts, setDeleteAttempts] = useState<{[key: string]: number}>({});

  const deleteProduct = async (productId: string, productName: string, onSuccess?: () => void) => {
    const attempts = deleteAttempts[productId] || 0;
    
    if (attempts === 0) {
      setDeleteAttempts(prev => ({ ...prev, [productId]: 1 }));
      
      toast({
        title: "Confirm Delete",
        description: `Double click delete to permanently delete ${productName}`,
        variant: "destructive",
        duration: 3000,
      });

      setTimeout(() => {
        setDeleteAttempts(prev => ({ ...prev, [productId]: 0 }));
      }, 3000);
      
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });

      setDeleteAttempts(prev => ({ ...prev, [productId]: 0 }));
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    deleteProduct,
    deleteAttempts
  };
};