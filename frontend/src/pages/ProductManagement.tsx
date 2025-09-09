import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Plus, X, Upload, Image, Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductCustomization } from "@/types";
import { useAuth } from "@/services/auth";
import { Loader2 } from "lucide-react";

const ProductManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;

  // Mock product data for editing
  const existingProduct = isEdit
    ? {
        id: Number(id),
        name: "Diamond Engagement Ring",
        price: 2499,
        category: "rings",
        description:
          "Exquisite diamond engagement ring crafted with precision and elegance This breathtaking diamond engagement ring represents the perfect symbol of eternal love.",
        inStock: true,
        specifications: {
          Material: "18k White Gold",
          "Diamond Weight": "1.5 carats",
          "Diamond Cut": "Brilliant",
          "Diamond Color": "D (Colorless)",
          "Diamond Clarity": "VVS1",
          "Ring Size": "Adjustable",
          Certification: "GIA Certified",
        },
      }
    : null;

  const [formData, setFormData] = useState({
    name: existingProduct?.name || "",
    price: existingProduct?.price || "",
    category: existingProduct?.category || "",
    description: existingProduct?.description || "",
    inStock: existingProduct?.inStock ?? true,
    material: existingProduct?.specifications?.Material || "",
    weight: existingProduct?.specifications?.["Diamond Weight"] || "",
    cut: existingProduct?.specifications?.["Diamond Cut"] || "",
    color: existingProduct?.specifications?.["Diamond Color"] || "",
    clarity: existingProduct?.specifications?.["Diamond Clarity"] || "",
    size: existingProduct?.specifications?.["Ring Size"] || "",
    certification: existingProduct?.specifications?.Certification || "",
  });

  const [customizations, setCustomizations] = useState<ProductCustomization[]>(
    []
  );
  const [newCustomization, setNewCustomization] = useState({
    name: "",
    type: "select" as "select" | "range" | "text",
    options: "",
    min: "",
    max: "",
    unit: "",
    required: false,
    default_value: "",
  });

  // File upload states
  const [model3DFile, setModel3DFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [model3DPreview, setModel3DPreview] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Add state for loading and categories
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

  // Update the fetchCategories function with more detailed logging
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔄 Fetching categories...');
        const response = await fetch('http://localhost:3000/api/categories');
        console.log('📡 Categories response status:', response.status);
        console.log('📡 Categories response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Categories fetch failed:', response.status, response.statusText);
          console.error('❌ Error response body:', errorText);
          return;
        }
        
        const data = await response.json();
        console.log('📦 Categories data received:', data);
        console.log('📊 Number of categories:', data.length);
        console.log('📋 Categories structure:', data[0]); // Log first category structure
        
        setCategories(data);
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Add this function to create default categories
  const createDefaultCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/setup/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        // Refresh categories
        const categoriesResponse = await fetch('http://localhost:3000/api/categories');
        const data = await categoriesResponse.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to create default categories:', error);
    }
  };

  // Replace the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Check if user is admin before proceeding
      if (!user || user.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Admin access required.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      // First, create the product
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        category_id: Number(formData.category),
        description: formData.description,
        is_active: formData.inStock,
        specifications: {
          Material: formData.material,
          "Diamond Weight": formData.weight,
          "Diamond Cut": formData.cut,
          "Diamond Color": formData.color,
          "Diamond Clarity": formData.clarity,
          "Ring Size": formData.size,
          Certification: formData.certification,
        },
        customizations: customizations,
      };

      console.log('Creating product with data:', productData);
      console.log('Using token:', token ? 'Token present' : 'No token');

      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Make sure Bearer is included
        },
        body: JSON.stringify(productData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to create product');
      }

      const createdProduct = await response.json();
      const productId = createdProduct.product.id;

      // Upload images if any
      if (imageFiles.length > 0) {
        try {
          const formData = new FormData();
          imageFiles.forEach((file) => {
            formData.append('images', file);
          });

          console.log('🖼️ Uploading images for product:', productId);
          console.log('📁 Number of images:', imageFiles.length);

          const imageResponse = await fetch(`http://localhost:3000/api/products/${productId}/images/bulk`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          console.log('📷 Image upload response status:', imageResponse.status);

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            console.error('❌ Image upload failed:', errorData);
            toast({
              title: "Warning",
              description: `Product created but image upload failed: ${errorData.message}`,
              variant: "destructive",
            });
          } else {
            const imageData = await imageResponse.json();
            console.log('✅ Images uploaded successfully:', imageData);
            toast({
              title: "Images Uploaded",
              description: `${imageData.images.length} images uploaded successfully.`,
            });
          }
        } catch (imageError) {
          console.error('❌ Image upload error:', imageError);
          toast({
            title: "Warning",
            description: "Product created but image upload failed.",
            variant: "destructive",
          });
        }
      }

      // Upload 3D model if any
      if (model3DFile) {
        const modelFormData = new FormData();
        modelFormData.append('model', model3DFile);

        const modelResponse = await fetch(`http://localhost:3000/api/products/${productId}/model`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: modelFormData,
        });

        if (!modelResponse.ok) {
          console.error('Failed to upload 3D model');
        }
      }

      toast({
        title: "Product Created",
        description: `${productData.name} has been created successfully.`,
      });

      navigate("/admin");

    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // File upload handlers
  const handle3DModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModel3DFile(file);
      setModel3DPreview(file.name);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const remove3DModel = () => {
    setModel3DFile(null);
    setModel3DPreview("");
  };

  // Protect admin route
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  // Add this debugging section right after your state declarations
  useEffect(() => {
    console.log('🔍 ProductManagement Debug Info:');
    console.log('- User:', user);
    console.log('- Categories:', categories);
    console.log('- Categories length:', categories?.length);
    console.log('- Backend URL:', 'http://localhost:3000/api/categories');
  }, [user, categories]);

  // Don't render if not admin
  if (!user || user.role !== 'admin') {
    return <div>Loading...</div>;
  }

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

        {/* Add this button after the "Back to Admin Dashboard" button for testing */}
        {categories.length === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 mb-2">No categories found. Create default categories first:</p>
            <Button onClick={createDefaultCategories} variant="outline">
              Create Default Categories
            </Button>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEdit ? (
                  "Edit Product"
                ) : (
                  <>
                    <Plus className="h-5 w-5" /> Add New Product
                  </>
                )}
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
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
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

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", Number(e.target.value))
                      }
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Brief description of the product"
                    rows={3}
                    required
                  />
                </div>

                {/* Specifications */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Product Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={formData.material}
                        onChange={(e) =>
                          handleInputChange("material", e.target.value)
                        }
                        placeholder="e.g., 18k White Gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="e.g., 1.5 carats"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cut">Cut</Label>
                      <Input
                        id="cut"
                        value={formData.cut}
                        onChange={(e) =>
                          handleInputChange("cut", e.target.value)
                        }
                        placeholder="e.g., Brilliant"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) =>
                          handleInputChange("color", e.target.value)
                        }
                        placeholder="e.g., D (Colorless)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clarity">Clarity</Label>
                      <Input
                        id="clarity"
                        value={formData.clarity}
                        onChange={(e) =>
                          handleInputChange("clarity", e.target.value)
                        }
                        placeholder="e.g., VVS1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        value={formData.size}
                        onChange={(e) =>
                          handleInputChange("size", e.target.value)
                        }
                        placeholder="e.g., Adjustable"
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="certification">Certification</Label>
                    <Input
                      id="certification"
                      value={formData.certification}
                      onChange={(e) =>
                        handleInputChange("certification", e.target.value)
                      }
                      placeholder="e.g., GIA Certified"
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Product Files</h3>

                  {/* 3D Model Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="model3d">3D Model File</Label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            id="model3d"
                            type="file"
                            accept=".glb,.gltf,.obj,.fbx"
                            onChange={handle3DModelUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("model3d")?.click()
                            }
                            className="w-full"
                          >
                            <Box className="h-4 w-4 mr-2" />
                            Choose 3D Model
                          </Button>
                        </div>
                        {model3DPreview && (
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{model3DPreview}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={remove3DModel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Images Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="images">Product Images</Label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("images")?.click()
                            }
                            className="w-full"
                          >
                            <Image className="h-4 w-4 mr-2" />
                            Add Images
                          </Button>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {imageFiles.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {imageFiles.length} image(s) selected
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Customizations */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Product Customizations
                  </h3>

                  {/* Existing Customizations */}
                  {customizations.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {customizations.map((customization) => (
                        <div
                          key={customization.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {customization.type}
                            </Badge>
                            <span className="font-medium">
                              {customization.name}
                            </span>
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
                            onClick={() =>
                              removeCustomization(customization.id)
                            }
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
                      <CardTitle className="text-base">
                        Add Customization Option
                      </CardTitle>
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
                            onValueChange={(
                              value: "select" | "range" | "text"
                            ) =>
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
                              <SelectItem value="select">
                                Select Options
                              </SelectItem>
                              <SelectItem value="range">
                                Range/Slider
                              </SelectItem>
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

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) =>
                      handleInputChange("inStock", checked)
                    }
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEdit ? "Update Product" : "Create Product"}
                      </>
                    )}
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
