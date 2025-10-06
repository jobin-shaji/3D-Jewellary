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

  // Select default variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
      // First try to find a variant with stock
      const variantWithStock = product.variants.find(variant => variant.stock_quantity > 0);
      
      if (variantWithStock) {
        setSelectedVariant(variantWithStock);
      } else {
        // If no variants have stock, select the first variant
        setSelectedVariant(product.variants[0]);
      }
    }
  }, [product, selectedVariant]);

  // Update calculated price when product loads or variant changes
  useEffect(() => {
    // Don't set price immediately when variant changes - wait for PriceSummary to provide authoritative price
    if (product && !selectedVariant) {
      // Only set initial price when no variant is selected (base product price)
      setCalculatedPrice(product.totalPrice || product.makingPrice || 0);
    } else if (selectedVariant) {
      // When variant is selected, temporarily set to null to show loading until PriceSummary provides the price
      setCalculatedPrice(null);
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