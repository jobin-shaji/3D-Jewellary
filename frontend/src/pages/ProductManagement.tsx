import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductCustomization } from "@/types";

const ProductManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  // Mock product data for editing
  const existingProduct = isEdit ? {
    id: Number(id),
    name: "Diamond Engagement Ring",
    price: 2499,
    originalPrice: 2999,
    category: "rings",
    description: "Exquisite diamond engagement ring crafted with precision and elegance.",
    fullDescription: "This breathtaking diamond engagement ring represents the perfect symbol of eternal love.",
    inStock: true,
    specifications: {
      "Material": "18k White Gold",
      "Diamond Weight": "1.5 carats",
      "Diamond Cut": "Brilliant",
      "Diamond Color": "D (Colorless)",
      "Diamond Clarity": "VVS1",
      "Ring Size": "Adjustable",
      "Certification": "GIA Certified"
    }
  } : null;

  const [formData, setFormData] = useState({
    name: existingProduct?.name || "",
    price: existingProduct?.price || "",
    originalPrice: existingProduct?.originalPrice || "",
    category: existingProduct?.category || "",
    description: existingProduct?.description || "",
    fullDescription: existingProduct?.fullDescription || "",
    inStock: existingProduct?.inStock ?? true,
    material: existingProduct?.specifications?.Material || "",
    weight: existingProduct?.specifications?.["Diamond Weight"] || "",
    cut: existingProduct?.specifications?.["Diamond Cut"] || "",
    color: existingProduct?.specifications?.["Diamond Color"] || "",
    clarity: existingProduct?.specifications?.["Diamond Clarity"] || "",
    size: existingProduct?.specifications?.["Ring Size"] || "",
    certification: existingProduct?.specifications?.Certification || ""
  });

  const [customizations, setCustomizations] = useState<ProductCustomization[]>([]);
  const [newCustomization, setNewCustomization] = useState({
    name: "",
    type: "select" as "select" | "range" | "text",
    options: "",
    min: "",
    max: "",
    unit: "",
    required: false,
    default_value: ""
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCustomization = () => {
    if (!newCustomization.name.trim()) return;

    const customization: ProductCustomization = {
      id: `custom_${Date.now()}`,
      name: newCustomization.name,
      type: newCustomization.type,
      required: newCustomization.required,
      ...(newCustomization.type === "select" && {
        options: newCustomization.options.split(",").map(opt => opt.trim()).filter(Boolean)
      }),
      ...(newCustomization.type === "range" && {
        min: Number(newCustomization.min),
        max: Number(newCustomization.max),
        unit: newCustomization.unit
      }),
      ...(newCustomization.default_value && {
        default_value: newCustomization.type === "range" ? Number(newCustomization.default_value) : newCustomization.default_value
      })
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
      default_value: ""
    });
  };

  const removeCustomization = (id: string) => {
    setCustomizations(customizations.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock save functionality
    console.log("Saving product:", { ...formData, customizations });
    
    toast({
      title: isEdit ? "Product Updated" : "Product Created",
      description: `${formData.name} has been ${isEdit ? "updated" : "created"} successfully.`,
    });
    
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEdit ? "Edit Product" : <><Plus className="h-5 w-5" /> Add New Product</>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rings">Rings</SelectItem>
                        <SelectItem value="necklaces">Necklaces</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="bracelets">Bracelets</SelectItem>
                        <SelectItem value="watches">Watches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", Number(e.target.value))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (optional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange("originalPrice", Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of the product"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Full Description</Label>
                  <Textarea
                    id="fullDescription"
                    value={formData.fullDescription}
                    onChange={(e) => handleInputChange("fullDescription", e.target.value)}
                    placeholder="Detailed description of the product"
                    rows={5}
                  />
                </div>

                {/* Specifications */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={formData.material}
                        onChange={(e) => handleInputChange("material", e.target.value)}
                        placeholder="e.g., 18k White Gold"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="e.g., 1.5 carats"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cut">Cut</Label>
                      <Input
                        id="cut"
                        value={formData.cut}
                        onChange={(e) => handleInputChange("cut", e.target.value)}
                        placeholder="e.g., Brilliant"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        placeholder="e.g., D (Colorless)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clarity">Clarity</Label>
                      <Input
                        id="clarity"
                        value={formData.clarity}
                        onChange={(e) => handleInputChange("clarity", e.target.value)}
                        placeholder="e.g., VVS1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        value={formData.size}
                        onChange={(e) => handleInputChange("size", e.target.value)}
                        placeholder="e.g., Adjustable"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="certification">Certification</Label>
                    <Input
                      id="certification"
                      value={formData.certification}
                      onChange={(e) => handleInputChange("certification", e.target.value)}
                      placeholder="e.g., GIA Certified"
                    />
                  </div>
                </div>

                {/* Product Customizations */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Product Customizations</h3>
                  
                  {/* Existing Customizations */}
                  {customizations.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {customizations.map((customization) => (
                        <div key={customization.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{customization.type}</Badge>
                            <span className="font-medium">{customization.name}</span>
                            {customization.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            {customization.options && (
                              <span className="text-sm text-muted-foreground">
                                Options: {customization.options.join(", ")}
                              </span>
                            )}
                            {customization.min !== undefined && customization.max !== undefined && (
                              <span className="text-sm text-muted-foreground">
                                Range: {customization.min}-{customization.max} {customization.unit}
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
                            onChange={(e) => setNewCustomization(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Ring Size, Chain Length"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={newCustomization.type} onValueChange={(value: "select" | "range" | "text") => setNewCustomization(prev => ({ ...prev, type: value }))}>
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
                            onChange={(e) => setNewCustomization(prev => ({ ...prev, options: e.target.value }))}
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
                              onChange={(e) => setNewCustomization(prev => ({ ...prev, min: e.target.value }))}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Value</Label>
                            <Input
                              type="number"
                              value={newCustomization.max}
                              onChange={(e) => setNewCustomization(prev => ({ ...prev, max: e.target.value }))}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit</Label>
                            <Input
                              value={newCustomization.unit}
                              onChange={(e) => setNewCustomization(prev => ({ ...prev, unit: e.target.value }))}
                              placeholder="cm, mm, inches"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newCustomization.required}
                            onCheckedChange={(checked) => setNewCustomization(prev => ({ ...prev, required: checked }))}
                          />
                          <Label>Required Field</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Default Value (optional)</Label>
                          <Input
                            value={newCustomization.default_value}
                            onChange={(e) => setNewCustomization(prev => ({ ...prev, default_value: e.target.value }))}
                            placeholder="Default option or value"
                          />
                        </div>
                      </div>

                      <Button onClick={addCustomization} disabled={!newCustomization.name.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customization
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) => handleInputChange("inStock", checked)}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button type="submit" className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? "Update Product" : "Create Product"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductManagement;