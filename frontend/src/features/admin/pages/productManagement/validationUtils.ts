import { toast } from "@/shared/hooks/use-toast";
import { ProductFormData } from "./BasicInfoForm";
import { PricingInventoryData } from "./PricingInventoryForm";

export const validateField = (field: string, value: any) => {
  const validators = {
    name: (val: string) => {
      if (!val.trim()) return "Product name is required";
      if (val.length < 2) return "Name must be at least 2 characters";
      if (val.length > 100) return "Name must be less than 100 characters";
      return null;
    },
    price: (val: string | number) => {
      const numVal = Number(val);
      if (!val) return "Price is required";
      if (isNaN(numVal)) return "Price must be a valid number";
      if (numVal <= 0) return "Price must be greater than 0";
      if (numVal > 1000000) return "Price seems too high (max: 1,000,000)";
      return null;
    },
    category_id: (val: string) => {
      if (!val) return "Please select a category";
      return null;
    },
    description: (val: string) => {
      if (!val.trim()) return "Product description is required";
      if (val.length < 10) return "Description must be at least 10 characters";
      if (val.length > 1000) return "Description must be less than 1000 characters";
      return null;
    },
    stock_quantity: (val: string | number) => {
      const numVal = Number(val);
      if (!val && val !== 0) return "Stock quantity is required";
      if (isNaN(numVal)) return "Stock quantity must be a valid number";
      if (numVal < 0) return "Stock quantity cannot be negative";
      if (numVal > 100000) return "Stock quantity seems too high";
      return null;
    }
  };

  const error = validators[field]?.(value);
  if (error) {
    toast({
      title: "Validation Error",
      description: error,
      variant: "destructive",
    });
    return false;
  }
  return true;
};

// Comprehensive validation function that validates all fields at once
export const validateAllFields = (formData: ProductFormData, pricingData: PricingInventoryData): string | null => {
  // Check name
  if (!formData.name.trim()) {
    return "Product name is required";
  }
  if (formData.name.length < 2) {
    return "Name must be at least 2 characters";
  }
  if (formData.name.length > 100) {
    return "Name must be less than 100 characters";
  }

  // Check category
  if (!formData.category_id) {
    return "Please select a category";
  }

  // Check price
  const priceNum = Number(pricingData.price);
  if (!pricingData.price) {
    return "Price is required";
  }
  if (isNaN(priceNum)) {
    return "Price must be a valid number";
  }
  if (priceNum <= 0) {
    return "Price must be greater than 0";
  }
  if (priceNum > 1000000) {
    return "Price seems too high (max: 1,000,000)";
  }

  // Check description
  if (!formData.description.trim()) {
    return "Product description is required";
  }
  if (formData.description.length < 10) {
    return "Description must be at least 10 characters";
  }
  if (formData.description.length > 1000) {
    return "Description must be less than 1000 characters";
  }

  // Check stock quantity
  const stockNum = Number(pricingData.stock_quantity);
  if (pricingData.stock_quantity === "" || pricingData.stock_quantity === null || pricingData.stock_quantity === undefined) {
    return "Stock quantity is required";
  }
  if (isNaN(stockNum)) {
    return "Stock quantity must be a valid number";
  }
  if (stockNum < 0) {
    return "Stock quantity cannot be negative";
  }
  if (stockNum > 100000) {
    return "Stock quantity seems too high";
  }

  return null; // No validation errors
};