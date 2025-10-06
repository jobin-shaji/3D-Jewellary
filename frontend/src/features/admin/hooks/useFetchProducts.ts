import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/shared/types';
import { apiUrl } from '@/shared/lib/api';

export const useFetchProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [singleProductLoading, setSingleProductLoading] = useState(false);
  const [singleProductError, setSingleProductError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
  const response = await fetch(apiUrl('/api/products/all'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
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
  };

  const fetchProduct = async (id: string) => {
      try {
        setSingleProductLoading(true);
        setSingleProductError(null);
        setSingleProduct(null);
        const token = localStorage.getItem('token');

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
    };

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