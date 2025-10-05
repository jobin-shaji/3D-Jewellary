import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "@/features/products/hooks/useProducts";

export const useProductDetail = () => {
  const { id } = useParams();
  const { singleProduct: product, singleProductLoading: loading, singleProductError: error, fetchProduct } = useProducts();
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string | number>>({});

  // Fetch product when component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  // Update calculated price when product loads or customizations change
  useEffect(() => {
    if (product) {
      // For now, just use the product's totalPrice or makingPrice
      // This can be enhanced to calculate based on customizations/variants
      setCalculatedPrice(product.totalPrice || product.makingPrice || 0);
    }
  }, [product, selectedCustomizations]);

  const handlePriceCalculated = (totalPrice: number) => {
    setCalculatedPrice(totalPrice);
  };

  return {
    product,
    loading,
    error,
    calculatedPrice,
    selectedCustomizations,
    setSelectedCustomizations,
    handlePriceCalculated,
  };
};