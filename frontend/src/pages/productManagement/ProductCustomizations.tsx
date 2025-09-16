import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { ProductCustomization } from "@/types";

// Local types for ProductCustomizations
export interface NewCustomization {
  name: string;
  type: "select" | "range" | "text";
  options: string;
  min: string;
  max: string;
  unit: string;
  required: boolean;
  default_value: string;
}

export interface CustomizationsProps {
  customizations: ProductCustomization[];
  setCustomizations: React.Dispatch<React.SetStateAction<ProductCustomization[]>>;
  newCustomization: NewCustomization;
  setNewCustomization: React.Dispatch<React.SetStateAction<NewCustomization>>;
}

export const ProductCustomizations: React.FC<CustomizationsProps> = ({
  customizations,
  setCustomizations,
  newCustomization,
  setNewCustomization
}) => {
  const addCustomization = () => {
    if (!newCustomization.name.trim()) return;

    const customization: ProductCustomization = {
      id: `custom_${Date.now()}`,
      name: newCustomization.name,
      type: newCustomization.type,
      required: newCustomization.required,
      ...(newCustomization.type === "select" && {
        options: newCustomization.options
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean),
      }),
      ...(newCustomization.type === "range" && {
        min: Number(newCustomization.min),
        max: Number(newCustomization.max),
        unit: newCustomization.unit,
      }),
      ...(newCustomization.default_value && {
        default_value:
          newCustomization.type === "range"
            ? Number(newCustomization.default_value)
            : newCustomization.default_value,
      }),
    };

    setCustomizations([...customizations, customization]);
    setNewCustomization({
      name: "",
      type: "select",
      options: "",
      min: "",
      max: "",
      unit: "",
      required: false,
      default_value: "",
    });
  };

  const removeCustomization = (id: string) => {
    setCustomizations(customizations.filter((c) => c.id !== id));
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Product Customizations</h3>

      {/* Existing Customizations */}
      {customizations.length > 0 && (
        <div className="space-y-3 mb-6">
          {customizations.map((customization) => (
            <div
              key={customization.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{customization.type}</Badge>
                <span className="font-medium">{customization.name}</span>
                {customization.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
                {customization.options && (
                  <span className="text-sm text-muted-foreground">
                    Options: {customization.options.join(", ")}
                  </span>
                )}
                {customization.min !== undefined &&
                  customization.max !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      Range: {customization.min}-{customization.max}{" "}
                      {customization.unit}
                    </span>
                  )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCustomization(customization.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Customization Option</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customization Name</Label>
              <Input
                value={newCustomization.name}
                onChange={(e) =>
                  setNewCustomization((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., Ring Size, Chain Length"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newCustomization.type}
                onValueChange={(value: "select" | "range" | "text") =>
                  setNewCustomization((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Select Options</SelectItem>
                  <SelectItem value="range">Range/Slider</SelectItem>
                  <SelectItem value="text">Text Input</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {newCustomization.type === "select" && (
            <div className="space-y-2">
              <Label>Options (comma-separated)</Label>
              <Input
                value={newCustomization.options}
                onChange={(e) =>
                  setNewCustomization((prev) => ({
                    ...prev,
                    options: e.target.value,
                  }))
                }
                placeholder="e.g., Small, Medium, Large or 5, 6, 7, 8"
              />
            </div>
          )}

          {newCustomization.type === "range" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Min Value</Label>
                <Input
                  type="number"
                  value={newCustomization.min}
                  onChange={(e) =>
                    setNewCustomization((prev) => ({
                      ...prev,
                      min: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Value</Label>
                <Input
                  type="number"
                  value={newCustomization.max}
                  onChange={(e) =>
                    setNewCustomization((prev) => ({
                      ...prev,
                      max: e.target.value,
                    }))
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={newCustomization.unit}
                  onChange={(e) =>
                    setNewCustomization((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  placeholder="cm, mm, inches"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={newCustomization.required}
                onCheckedChange={(checked) =>
                  setNewCustomization((prev) => ({
                    ...prev,
                    required: checked,
                  }))
                }
              />
              <Label>Required Field</Label>
            </div>

            <div className="space-y-2">
              <Label>Default Value (optional)</Label>
              <Input
                value={newCustomization.default_value}
                onChange={(e) =>
                  setNewCustomization((prev) => ({
                    ...prev,
                    default_value: e.target.value,
                  }))
                }
                placeholder="Default option or value"
              />
            </div>
          </div>

          <Button
            onClick={addCustomization}
            disabled={!newCustomization.name.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};