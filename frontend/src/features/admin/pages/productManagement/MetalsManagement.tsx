import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
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

  // Purity options for each metal type
  const purityOptions = {
    Gold: [
      { value: "24k", label: "24k (99.9% pure)" },
      { value: "22k", label: "22k (91.7% pure)" },
      { value: "18k", label: "18k (75% pure)" },
      { value: "14k", label: "14k (58.3% pure)" },
      { value: "10k", label: "10k (41.7% pure)" }
    ],
    Silver: [
      { value: "Fine", label: "Fine Silver (99.9% pure)" },
      { value: "Sterling", label: "Sterling Silver (92.5% pure)" },
      { value: "Coin", label: "Coin Silver (90% pure)" },
      { value: "Britannia", label: "Britannia Silver (95.8% pure)" }
    ],
    Platinum: [
      { value: "950", label: "950 Platinum (95% pure)" },
      { value: "900", label: "900 Platinum (90% pure)" },
      { value: "850", label: "850 Platinum (85% pure)" }
    ]
  };

  // Handle metal type change and reset purity
  const handleMetalTypeChange = (value: string) => {
    setNewMetal((prev) => ({
      ...prev,
      type: value,
      purity: '' // Reset purity when metal type changes
    }));
  };

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
      color: ''
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
              <Select
                value={newMetal.type}
                onValueChange={handleMetalTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Purity *</Label>
              <Select
                value={newMetal.purity}
                onValueChange={(value) => setNewMetal((prev) => ({ ...prev, purity: value }))}
                disabled={!newMetal.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!newMetal.type ? "Select metal type first" : "Select purity"} />
                </SelectTrigger>
                <SelectContent>
                  {newMetal.type && purityOptions[newMetal.type as keyof typeof purityOptions]?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
          <Button onClick={addMetal} disabled={!newMetal.type.trim()} type="button">
            <Plus className="h-4 w-4 mr-2" />
            Add Metal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
