import React from "react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { validateField } from "./validationUtils";

// Local types for PricingInventoryForm
export interface PricingInventoryData {
  price: string | number;
  stock_quantity: string;
}

type PricingInventoryFormProps = {
  formData: PricingInventoryData;
  onInputChange: (field: string, value: string | number | boolean) => void;
}

// Pricing & Inventory Form Component
export const PricingInventoryForm: React.FC<PricingInventoryFormProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Pricing and Inventory</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => onInputChange("price", Number(e.target.value))}
            onBlur={(e) => validateField('price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) => onInputChange("stock_quantity", e.target.value)}
            onBlur={(e) => validateField('stock_quantity', e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>
    </div>
  );
};