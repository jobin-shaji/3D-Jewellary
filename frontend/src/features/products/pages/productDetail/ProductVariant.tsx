import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { ProductVariant as VariantType } from "@/shared/types";

interface ProductVariantProps {
  variants: VariantType[];
  selectedVariant?: VariantType | null;
  onVariantChange: (selectedVariant: VariantType | null) => void;
}

const ProductVariant = ({ variants, selectedVariant, onVariantChange }: ProductVariantProps) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  // Sync local state with parent's selectedVariant
  useEffect(() => {
    if (selectedVariant?.variant_id) {
      setSelectedVariantId(selectedVariant.variant_id);
    } else {
      setSelectedVariantId("");
    }
  }, [selectedVariant]);

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    const selectedVariant = variants.find(variant => variant.variant_id === variantId) || null;
    onVariantChange(selectedVariant);
  };

  // Only render if there are variants
  if (!variants || variants.length === 0) return null;

  const currentVariant = variants.find(variant => variant.variant_id === selectedVariantId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Variant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="variant-select" className="font-medium">
            Available Variants
          </Label>
          
          <Select
            value={selectedVariantId}
            onValueChange={handleVariantChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a variant" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((variant) => (
                <SelectItem 
                  key={variant.variant_id} 
                  value={variant.variant_id || ""}
                  disabled={variant.stock_quantity === 0}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{variant.name}</span>
                    {variant.stock_quantity === 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductVariant;