import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCustomization as CustomizationType } from "@/types";

interface ProductCustomizationProps {
  customizations: CustomizationType[];
  onCustomizationChange: (customizations: Record<string, string | number>) => void;
}

const ProductCustomization = ({ customizations, onCustomizationChange }: ProductCustomizationProps) => {
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string | number>>({});

  const handleCustomizationChange = (customizationId: string, value: string | number) => {
    const newCustomizations = {
      ...selectedCustomizations,
      [customizationId]: value
    };
    setSelectedCustomizations(newCustomizations);
    onCustomizationChange(newCustomizations);
  };

  if (customizations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Your Product</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {customizations.map((customization) => (
          <div key={customization.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={customization.id} className="font-medium">
                {customization.name}
                {customization.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {customization.unit && (
                <Badge variant="outline" className="text-xs">
                  {customization.unit}
                </Badge>
              )}
            </div>

            {customization.type === "select" && customization.options && (
              <Select
                value={selectedCustomizations[customization.id] as string || ""}
                onValueChange={(value) => handleCustomizationChange(customization.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${customization.name}`} />
                </SelectTrigger>
                <SelectContent>
                  {customization.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {customization.type === "range" && customization.min !== undefined && customization.max !== undefined && (
              <div className="space-y-3">
                <Slider
                  value={[selectedCustomizations[customization.id] as number || customization.min]}
                  onValueChange={([value]) => handleCustomizationChange(customization.id, value)}
                  min={customization.min}
                  max={customization.max}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{customization.min}{customization.unit}</span>
                  <span className="font-medium">
                    {selectedCustomizations[customization.id] || customization.min}{customization.unit}
                  </span>
                  <span>{customization.max}{customization.unit}</span>
                </div>
              </div>
            )}

            {customization.type === "text" && (
              <Input
                id={customization.id}
                placeholder={`Enter ${customization.name}`}
                value={selectedCustomizations[customization.id] as string || ""}
                onChange={(e) => handleCustomizationChange(customization.id, e.target.value)}
                maxLength={50}
              />
            )}

            {customization.default_value && !selectedCustomizations[customization.id] && (
              <p className="text-sm text-muted-foreground">
                Default: {customization.default_value}{customization.unit}
              </p>
            )}
          </div>
        ))}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Selected Customizations:</h4>
          {Object.keys(selectedCustomizations).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedCustomizations).map(([key, value]) => {
                const customization = customizations.find(c => c.id === key);
                return (
                  <Badge key={key} variant="secondary">
                    {customization?.name}: {value}{customization?.unit}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No customizations selected</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCustomization;