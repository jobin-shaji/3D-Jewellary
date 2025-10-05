import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, X, Edit2, Save, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { ProductVariant, Metal } from "@/shared/types";

// Local types for ProductVariants
export interface NewVariant {
  name: string;
  stock_quantity: string;
  making_price: string;
  metals: Metal[];
}

export interface NewMetal {
  type: string;
  purity: string;
  weight: string;
  color?: string;
}

// Validation function for variants
export const validateVariants = (variants: ProductVariant[]): string | null => {
  if (variants.length === 0) {
    return "Please add at least one product variant";
  }
  
  const variantNames = new Set();
  
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    
    // Check variant name
    if (!variant.name.trim()) {
      return `Variant ${i + 1}: Name is required`;
    }
    
    // Check for duplicate names
    if (variantNames.has(variant.name.toLowerCase())) {
      return `Variant "${variant.name}": Duplicate variant names are not allowed`;
    }
    variantNames.add(variant.name.toLowerCase());
    
    // Check making price
    if (!variant.making_price || variant.making_price <= 0) {
      return `Variant "${variant.name}": Making price must be greater than 0`;
    }
    
    // Check stock quantity
    if (variant.stock_quantity < 0) {
      return `Variant "${variant.name}": Stock quantity cannot be negative`;
    }
    
    // Check metals
    if (!variant.metal || variant.metal.length === 0) {
      return `Variant "${variant.name}": At least one metal specification is required`;
    }
    
    // Validate each metal in the variant
    for (let j = 0; j < variant.metal.length; j++) {
      const metal = variant.metal[j];
      
      if (!metal.type.trim()) {
        return `Variant "${variant.name}", Metal ${j + 1}: Metal type is required`;
      }
      
      if (!metal.purity.trim()) {
        return `Variant "${variant.name}", Metal ${j + 1}: Purity is required`;
      }
      
      if (!metal.weight || metal.weight <= 0) {
        return `Variant "${variant.name}", Metal ${j + 1}: Weight must be greater than 0`;
      }
      
      // Check reasonable weight limits
      if (metal.weight > 1000) {
        return `Variant "${variant.name}", Metal ${j + 1}: Weight seems too high (max: 1000g)`;
      }
    }
  }
  
  return null; // No validation errors
};

export interface VariantsProps {
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
}

export const ProductVariants: React.FC<VariantsProps> = ({
  variants,
  setVariants
}) => {
  const [newVariant, setNewVariant] = useState<NewVariant>({
    name: "",
    stock_quantity: "0",
    making_price: "0",
    metals: []
  });

  const [newMetal, setNewMetal] = useState<NewMetal>({
    type: "",
    purity: "",
    weight: "0",
    color: ""
  });

  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<ProductVariant | null>(null);

  const metalTypes = ["Gold", "Silver", "Platinum", "Palladium", "Rose Gold", "White Gold"];
  const purityOptions = {
    Gold: ["24k", "22k", "18k", "14k", "10k"],
    Silver: ["999", "925", "900", "800"],
    Platinum: ["950", "900", "850"],
    Palladium: ["950", "500"],
    "Rose Gold": ["18k", "14k", "10k"],
    "White Gold": ["18k", "14k", "10k"]
  };

  const generateVariantId = () => {
    return 'var_' + Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addMetalToNewVariant = () => {
    if (!newMetal.type || !newMetal.purity || !newMetal.weight) return;

    const metal: Metal = {
      type: newMetal.type,
      purity: newMetal.purity,
      weight: Number(newMetal.weight),
      color: newMetal.color
    };

    setNewVariant(prev => ({
      ...prev,
      metals: [...prev.metals, metal]
    }));

    setNewMetal({
      type: "",
      purity: "",
      weight: "0",
      color: ""
    });
  };

  const removeMetalFromNewVariant = (index: number) => {
    setNewVariant(prev => ({
      ...prev,
      metals: prev.metals.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    if (!newVariant.name.trim() || newVariant.metals.length === 0) return;

    const variant: ProductVariant = {
      variant_id: generateVariantId(),
      name: newVariant.name,
      stock_quantity: Number(newVariant.stock_quantity),
      making_price: Number(newVariant.making_price),
      metal: newVariant.metals,
      totalPrice: Number(0) // This will be calculated on backend
    };

    setVariants([...variants, variant]);
    setNewVariant({
      name: "",
      stock_quantity: "0",
      making_price: "0",
      metals: []
    });
  };

  const removeVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.variant_id !== variantId));
  };

  const startEditing = (variant: ProductVariant) => {
    setEditingVariant(variant.variant_id);
    setEditingData({ ...variant });
  };

  const cancelEditing = () => {
    setEditingVariant(null);
    setEditingData(null);
  };

  const saveVariant = () => {
    if (!editingData) return;

    setVariants(variants.map(v => 
      v.variant_id === editingData.variant_id ? editingData : v
    ));
    setEditingVariant(null);
    setEditingData(null);
  };

  const addMetalToEditingVariant = () => {
    if (!editingData || !newMetal.type || !newMetal.purity || !newMetal.weight) return;

    const metal: Metal = {
      type: newMetal.type,
      purity: newMetal.purity,
      weight: Number(newMetal.weight),
      color: newMetal.color
    };

    setEditingData({
      ...editingData,
      metal: [...editingData.metal, metal]
    });

    setNewMetal({
      type: "",
      purity: "",
      weight: "0",
      color: ""
    });
  };

  const removeMetalFromEditingVariant = (index: number) => {
    if (!editingData) return;

    setEditingData({
      ...editingData,
      metal: editingData.metal.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Product Variants</h3>

      {/* Existing Variants */}
      {variants.length > 0 && (
        <div className="space-y-4 mb-6">
          {variants.map((variant) => (
            <Card key={variant.variant_id} className="border border-gray-200">
              <CardContent className="p-4">
                {editingVariant === variant.variant_id && editingData ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={editingData.name}
                        onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                        className="font-medium text-lg"
                        placeholder="Variant name"
                      />
                      <div className="flex gap-2">
                        <Button onClick={saveVariant} size="sm" variant="default">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button onClick={cancelEditing} size="sm" variant="outline">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stock Quantity</Label>
                        <Input
                          type="number"
                          value={editingData.stock_quantity}
                          onChange={(e) => setEditingData({...editingData, stock_quantity: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Making Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingData.making_price}
                          onChange={(e) => setEditingData({...editingData, making_price: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    {/* Metals in Edit Mode */}
                    <div>
                      <Label className="text-sm font-medium">Metals</Label>
                      <div className="space-y-2 mt-2">
                        {editingData.metal.map((metal, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">
                              {metal.type} ({metal.purity}) - {metal.weight}g{metal.color ? ` - ${metal.color}` : ''}
                            </span>
                            <Button
                              onClick={() => removeMetalFromEditingVariant(index)}
                              size="sm"
                              variant="ghost"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add Metal to Editing Variant */}
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        <Select value={newMetal.type} onValueChange={(value) => setNewMetal({...newMetal, type: value, purity: ""})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Metal Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {metalTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select 
                          value={newMetal.purity} 
                          onValueChange={(value) => setNewMetal({...newMetal, purity: value})}
                          disabled={!newMetal.type}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Purity" />
                          </SelectTrigger>
                          <SelectContent>
                            {newMetal.type && purityOptions[newMetal.type as keyof typeof purityOptions]?.map((purity) => (
                              <SelectItem key={purity} value={purity}>
                                {purity}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Weight (g)"
                          value={newMetal.weight}
                          onChange={(e) => setNewMetal({...newMetal, weight: e.target.value})}
                        />

                        <Input
                          type="text"
                          placeholder="Color (optional)"
                          value={newMetal.color || ""}
                          onChange={(e) => setNewMetal({...newMetal, color: e.target.value})}
                        />

                        <Button onClick={addMetalToEditingVariant} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-lg">{variant.name}</h4>
                      <div className="flex gap-2">
                        <Button onClick={() => startEditing(variant)} size="sm" variant="outline">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => removeVariant(variant.variant_id)} size="sm" variant="destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">Stock:</span>
                        <p className="font-medium">{variant.stock_quantity}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Making Price:</span>
                        <p className="font-medium">₹{variant.making_price}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Total Price:</span>
                        <p className="font-medium">₹{variant.totalPrice}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">Metals:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {variant.metal.map((metal, index) => (
                          <Badge key={index} variant="secondary">
                            {metal.type} ({metal.purity}) - {metal.weight}g{metal.color ? ` - ${metal.color}` : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Variant */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Variant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="variant-name">Variant Name</Label>
            <Input
              id="variant-name"
              value={newVariant.name}
              onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
              placeholder="e.g., Small Size, Large Size, Custom Design"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock-quantity">Stock Quantity</Label>
              <Input
                id="stock-quantity"
                type="number"
                value={newVariant.stock_quantity}
                onChange={(e) => setNewVariant({...newVariant, stock_quantity: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="making-price">Making Price (₹)</Label>
              <Input
                id="making-price"
                type="number"
                step="0.01"
                value={newVariant.making_price}
                onChange={(e) => setNewVariant({...newVariant, making_price: e.target.value})}
              />
            </div>
          </div>

          {/* Metals Section */}
          <div>
            <Label className="text-sm font-medium">Metals</Label>
            
            {/* Existing Metals */}
            {newVariant.metals.length > 0 && (
              <div className="space-y-2 mt-2">
                {newVariant.metals.map((metal, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">
                      {metal.type} ({metal.purity}) - {metal.weight}g{metal.color ? ` - ${metal.color}` : ''}
                    </span>
                    <Button
                      onClick={() => removeMetalFromNewVariant(index)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Metal Form */}
            <div className="grid grid-cols-5 gap-2 mt-2">
              <Select value={newMetal.type} onValueChange={(value) => setNewMetal({...newMetal, type: value, purity: ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Metal Type" />
                </SelectTrigger>
                <SelectContent>
                  {metalTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={newMetal.purity} 
                onValueChange={(value) => setNewMetal({...newMetal, purity: value})}
                disabled={!newMetal.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Purity" />
                </SelectTrigger>
                <SelectContent>
                  {newMetal.type && purityOptions[newMetal.type as keyof typeof purityOptions]?.map((purity) => (
                    <SelectItem key={purity} value={purity}>
                      {purity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                step="0.01"
                placeholder="Weight (g)"
                value={newMetal.weight}
                onChange={(e) => setNewMetal({...newMetal, weight: e.target.value})}
              />

              <Input
                type="text"
                placeholder="Color (optional)"
                value={newMetal.color || ""}
                onChange={(e) => setNewMetal({...newMetal, color: e.target.value})}
              />

              <Button onClick={addMetalToNewVariant} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={addVariant} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};