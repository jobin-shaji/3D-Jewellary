import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/shared/types';
import { apiUrl } from '@/shared/lib/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [singleProductLoading, setSingleProductLoading] = useState(false);
  const [singleProductError, setSingleProductError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
  const response = await fetch(apiUrl('/api/products'));
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Fetched products:', data);

      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id: string) => {
    try {
      setSingleProductLoading(true);
      setSingleProductError(null);
      setSingleProduct(null);

  const response = await fetch(apiUrl(`/api/products/${id}/full`));
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        } else {
          throw new Error('Failed to fetch product details');
        }
      }

      const productData = await response.json();
      setSingleProduct(productData);
      return productData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
      setSingleProductError(errorMessage);
      console.error('Error fetching product:', err);
      throw err;
    } finally {
      setSingleProductLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    
    // Set up periodic refresh every 5 minutes to catch price updates
    const interval = setInterval(() => {
      console.log('Auto-refreshing products for price updates...');
      fetchProducts();
    }, 5 * 60 * 1000); // 5 minutes

    // Refresh when user returns to tab (in case admin updated prices)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, refreshing products...');
        fetchProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    singleProduct,
    singleProductLoading,
    singleProductError,
    fetchProduct
  };
};