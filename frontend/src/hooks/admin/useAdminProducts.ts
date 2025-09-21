import { useState, useEffect } from 'react';
import { Product } from '@/shared/types';

export const useAdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Include inactive products for admin view
      const response = await fetch('http://localhost:3000/api/products?include_inactive=true');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Fetched admin products:', data);

      // Ensure we always have an array
      const fetchedProducts = Array.isArray(data.products) ? data.products : [];
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching admin products:', err);
      setProducts([]); // Set empty array on error to prevent UI issues
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    console.log(`Updating product ${productId} with:`, updates);
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => 
        product.id.toString() === productId 
          ? { ...product, ...updates }
          : product
      );
      console.log('Updated products array:', updatedProducts);
      return updatedProducts;
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    refetch: fetchProducts, // Alias for consistency
    updateProduct // New function for individual product updates
  };
};