import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductVariant } from "@/shared/types";

export const useProductDetail = () => {
  const { id } = useParams();
  const { singleProduct: product, singleProductLoading: loading, singleProductError: error, fetchProduct } = useProducts();
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Fetch product when component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  // Update calculated price when product loads or variant changes
  useEffect(() => {
    if (product) {
      if (selectedVariant) {
        // Use the selected variant's total price or making price
        setCalculatedPrice(selectedVariant.totalPrice || selectedVariant.making_price || 0);
      } else {
        // Use the product's totalPrice or makingPrice as fallback
        setCalculatedPrice(product.totalPrice || product.makingPrice || 0);
      }
    }
  }, [product, selectedVariant]);

  const handlePriceCalculated = (totalPrice: number) => {
    setCalculatedPrice(totalPrice);
  };

  return {
    product,
    loading,
    error,
    calculatedPrice,
    selectedVariant,
    setSelectedVariant,
    handlePriceCalculated,
  };
};