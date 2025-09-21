import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Gemstone } from "@/shared/types";

// Local types for GemstonesManagement
export interface GemstonesManagementProps {
  gemstones: Gemstone[];
  setGemstones: React.Dispatch<React.SetStateAction<Gemstone[]>>;
  newGemstone: Gemstone;
  setNewGemstone: React.Dispatch<React.SetStateAction<Gemstone>>;
}

export const GemstonesManagement: React.FC<GemstonesManagementProps> = ({
  gemstones,
  setGemstones,
  newGemstone,
  setNewGemstone
}) => {
  const { toast } = useToast();

  const addGemstone = () => {
    if (!newGemstone.type.trim() || newGemstone.carat <= 0 || newGemstone.count <= 0 || (newGemstone.price !== undefined && newGemstone.price < 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required gemstone fields (type, carat > 0, count > 0). Price must be 0 or greater if provided.",
        variant: "destructive",
      });
      return;
    }

    const gemstone: Gemstone = {
      id: `gemstone_${Date.now()}`,
      ...newGemstone
    };

    setGemstones([...gemstones, gemstone]);
    setNewGemstone({
      type: '',
      carat: 0,
      color: '',
      clarity: '',
      count: 1,
      shape: '',
      price: undefined
    });
  };

  const removeGemstone = (id: string) => {
    setGemstones(gemstones.filter((g) => g.id !== id));
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Gemstones</h3>
      
      {/* Existing Gemstones */}
      {gemstones.length > 0 && (
        <div className="space-y-3 mb-6">
          {gemstones.map((gemstone) => (
            <div
              key={gemstone.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Badge variant="outline">{gemstone.type}</Badge>
                <span className="font-medium">{gemstone.carat}ct</span>
                <span className="text-sm text-muted-foreground">
                  Count: {gemstone.count}
                </span>
                {gemstone.price !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    Price: ${gemstone.price}
                  </span>
                )}
                {gemstone.color && (
                  <span className="text-sm text-muted-foreground">
                    Color: {gemstone.color}
                  </span>
                )}
                {gemstone.clarity && (
                  <span className="text-sm text-muted-foreground">
                    {gemstone.clarity}
                  </span>
                )}
                {gemstone.shape && (
                  <span className="text-sm text-muted-foreground">
                    Shape: {gemstone.shape}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGemstone(gemstone.id!)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Gemstone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Gemstone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Gemstone Type *</Label>
              <Input
                value={newGemstone.type}
                onChange={(e) =>
                  setNewGemstone((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                placeholder="e.g., Diamond, Ruby, Emerald"
              />
            </div>
            <div className="space-y-2">
              <Label>Carat Weight *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newGemstone.carat}
                onChange={(e) =>
                  setNewGemstone((prev) => ({
                    ...prev,
                    carat: Number(e.target.value),
                  }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Count *</Label>
              <Input
                type="number"
                min="1"
                value={newGemstone.count}
                onChange={(e) =>
                  setNewGemstone((prev) => ({
                    ...prev,
                    count: Number(e.target.value),
                  }))
                }
                placeholder="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newGemstone.price ?? ''}
                onChange={(e) =>
                  setNewGemstone((prev) => ({
                    ...prev,
                    price: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="Price per carat or total price (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Shape</Label>
              <Input
                value={newGemstone.shape}
                onChange={(e) =>
                  setNewGemstone((prev) => ({
                    ...prev,
                    shape: e.target.value,
                  }))
                }
                placeholder="e.g., Round, Oval, Pear"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                value={newGemstone.color}
                onChange={(e) =>
                  setNewGemstone((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
                placeholder="e.g., D, E, F for diamonds"
              />
            </div>
            <div className="space-y-2">
              <Label>Clarity</Label>
              <Input
                value={newGemstone.clarity}
                onChange={(e) =>
                  setNewGemstone((prev) => ({
                    ...prev,
                    clarity: e.target.value,
                  }))
                }
                placeholder="e.g., FL, IF, VVS1"
              />
            </div>
          </div>
          <Button onClick={addGemstone} disabled={!newGemstone.type.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Gemstone
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
