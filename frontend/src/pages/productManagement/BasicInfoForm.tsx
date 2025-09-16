import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Local types for BasicInfoForm
export interface ProductFormData {
  name: string;
  price: string | number;
  category: string;
  description: string;
  inStock: boolean;
  stock_quantity: string;
  size: string;
  certification: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface FormSectionProps {
  formData: ProductFormData;
  onInputChange: (field: string, value: string | number | boolean) => void;
  categories?: Category[];
}

// Combined BasicInfo and Pricing Form
export const BasicInfoForm: React.FC<FormSectionProps> = ({
  formData,
  onInputChange,
  categories = []
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onInputChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="border-t pt-6">
        {/* <h3 className="text-lg font-semibold mb-4">Pricing & Inventory</h3> */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => onInputChange("price", Number(e.target.value))}
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
              placeholder="0"
              required
            />
          </div>
        </div>
      </div>
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Product Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Brief description of the product"
          rows={3}
          required
        />
      </div>
    </div>
  );
};