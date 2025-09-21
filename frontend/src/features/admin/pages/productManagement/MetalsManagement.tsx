import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Metal } from "@/shared/types";

// Local types for MetalsManagement
export interface MetalsManagementProps {
  metals: Metal[];
  setMetals: React.Dispatch<React.SetStateAction<Metal[]>>;
  newMetal: Metal;
  setNewMetal: React.Dispatch<React.SetStateAction<Metal>>;
}

export const MetalsManagement: React.FC<MetalsManagementProps> = ({
  metals,
  setMetals,
  newMetal,
  setNewMetal
}) => {
  const { toast } = useToast();

  const addMetal = () => {
    if (!newMetal.type.trim() || !newMetal.purity.trim() || newMetal.weight <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required metal fields (type, purity, weight > 0).",
        variant: "destructive",
      });
      return;
    }

    const metal: Metal = {
      id: `metal_${Date.now()}`,
      ...newMetal
    };

    setMetals([...metals, metal]);
    setNewMetal({
      type: '',
      purity: '',
      weight: 0,
      color: '',
      percentage: 0
    });
  };

  const removeMetal = (id: string) => {
    setMetals(metals.filter((m) => m.id !== id));
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Metals</h3>
      
      {/* Existing Metals */}
      {metals.length > 0 && (
        <div className="space-y-3 mb-6">
          {metals.map((metal) => (
            <div
              key={metal.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline">{metal.type}</Badge>
                <span className="font-medium">{metal.purity}</span>
                <span className="text-sm text-muted-foreground">
                  {metal.weight}g
                </span>
                {metal.color && (
                  <span className="text-sm text-muted-foreground">
                    {metal.color}
                  </span>
                )}
                {metal.percentage > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {metal.percentage}%
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMetal(metal.id!)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Metal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Metal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Metal Type *</Label>
              <Input
                value={newMetal.type}
                onChange={(e) =>
                  setNewMetal((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                placeholder="e.g., Gold, Silver, Platinum"
              />
            </div>
            <div className="space-y-2">
              <Label>Purity *</Label>
              <Input
                value={newMetal.purity}
                onChange={(e) =>
                  setNewMetal((prev) => ({
                    ...prev,
                    purity: e.target.value,
                  }))
                }
                placeholder="e.g., 18k, 14k, 925"
              />
            </div>
            <div className="space-y-2">
              <Label>Weight (grams) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newMetal.weight}
                onChange={(e) =>
                  setNewMetal((prev) => ({
                    ...prev,
                    weight: Number(e.target.value),
                  }))
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                value={newMetal.color}
                onChange={(e) =>
                  setNewMetal((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                placeholder="e.g., White, Yellow, Rose"
              />
            </div>
            <div className="space-y-2">
              <Label>Percentage</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newMetal.percentage}
                onChange={(e) =>
                  setNewMetal((prev) => ({
                    ...prev,
                    percentage: Number(e.target.value),
                  }))
                }
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={addMetal} disabled={!newMetal.type.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Metal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
