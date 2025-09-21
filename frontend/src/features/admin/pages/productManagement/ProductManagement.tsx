import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { ProductCustomization, Metal, Gemstone ,Category,Product} from "@/shared/types";
import { useAuth } from "@/shared/contexts/auth";
import { type Certification } from "./SpecificationsForm";

// Import our new components individually for better tree shaking
import { BasicInfoForm, type ProductFormData } from "./BasicInfoForm";
import { SpecificationsForm } from "./SpecificationsForm";
import { MetalsManagement } from "./MetalsManagement";
import { GemstonesManagement } from "./GemstonesManagement";
import { FileUploadSection, type FileUploadState } from "./FileUploadSection";
import { ProductCustomizations, type NewCustomization } from "./ProductCustomizations";
import { validateAllFields } from "./validationUtils";
import { 
  useFileUpload,
  createProduct,
  uploadProductImages,
  upload3DModel,
  uploadCertificates,
  fetchCategories
} from "./hooks";

// Validation and utility functions
const createProductData = (
  formData: ProductFormData,
  metals: Metal[],
  gemstones: Gemstone[],
  customizations: ProductCustomization[]
): Product => {
  return {
    name: formData.name,
    price: Number(formData.price),
    category_id: Number(formData.category_id),
    description: formData.description,
    is_active: formData.inStock,
    stock_quantity: Number(formData.stock_quantity || 0),
    metals: metals.map(({ id, ...metal }) => metal), // Remove frontend-only id
    gemstones: gemstones.map(({ id, ...gemstone }) => gemstone), // Remove frontend-only id
    customizations: customizations,
  };
};

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
        category_id:"123",
        category: "rings",
        description:
          "Exquisite diamond engagement ring crafted with precision and elegance This breathtaking diamond engagement ring represents the perfect symbol of eternal love.",
        inStock: true,
        stock_quantity: 10, // added
      }
    : null;

  const [formData, setFormData] = useState<ProductFormData>({
    name: existingProduct?.name || "",
    price: existingProduct?.price || "",
    category_id: existingProduct?.category_id || "",
    description: existingProduct?.description || "",
    inStock: existingProduct?.inStock ?? true,
    stock_quantity: existingProduct?.stock_quantity?.toString?.() || "0",
  });

  const [customizations, setCustomizations] = useState<ProductCustomization[]>([]);
  const [newCustomization, setNewCustomization] = useState<NewCustomization>({
    name: "",
    type: "select" as "select" | "range" | "text",
    options: "",
    min: "",
    max: "",
    unit: "",
    required: false,
    default_value: "",
  });

  // File upload states using our custom hook
  const { fileState, handle3DModelUpload, handleImageUpload, removeImage, remove3DModel } = useFileUpload();

  // Add state for loading and categories
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // State for metals and gemstones
  const [metals, setMetals] = useState<Metal[]>([]);
  const [gemstones, setGemstones] = useState<Gemstone[]>([]);
  const [certificates, setCertifications] = useState<Certification[]>([]);
  const [newMetal, setNewMetal] = useState<Metal>({
    type: '',
    purity: '',
    weight: 0,
    color: ''
  });
  const [newGemstone, setNewGemstone] = useState<Gemstone>({
    type: '',
    carat: 0,
    color: '',
    clarity: '',
    count: 1,
    shape: '',
    price: 0
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update the fetchCategories function with more detailed logging
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Fetching categories...');
        const data = await fetchCategories();
        console.log('Categories data received:', data);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Replace the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields using our utility function
      const validationError = validateAllFields(formData);
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      // Create product data using our utility function
      const Product = createProductData(formData, metals, gemstones, customizations);

      console.log('Creating product with data:', Product);

      // Create the product using our utility function
      const createdProduct = await createProduct(Product);
      const productId = createdProduct.product.id;

      // Upload images if any using our utility function
      if (fileState.imageFiles.length > 0) {
        try {
          console.log('Uploading images for product:', productId);
          const imageData = await uploadProductImages(productId, fileState.imageFiles);
          console.log('✅ Images uploaded successfully:', imageData);
          toast({
            title: "Images Uploaded",
            description: `${imageData.images.length} images uploaded successfully.`,
          });
        } catch (imageError) {
          console.error('❌ Image upload error:', imageError);
          toast({
            title: "Warning",
            description: "Product created but image upload failed.",
            variant: "destructive",
          });
        }
      }

      // Upload 3D model if any using our utility function
      if (fileState.model3DFile) {
        try {
          console.log('📦 Uploading 3D model for product:', productId);
          const modelData = await upload3DModel(productId, fileState.model3DFile);
          console.log('✅ 3D model uploaded successfully:', modelData);
          toast({
            title: "3D Model Uploaded",
            description: "3D model uploaded successfully.",
          });
        } catch (modelError) {
          console.error('❌ 3D model upload error:', modelError);
          toast({
            title: "Warning",
            description: "Product created but 3D model upload failed.",
            variant: "destructive",
          });
        }
      }

      // Upload certificates if any
      if (certificates.length > 0) {
        try {
          console.log('📄 Uploading certificates for product:', productId);
          const certificatesData = certificates.map(cert => ({
            name: cert.name,
            file: cert.file!
          }));
          const uploadedCertificates = await uploadCertificates(productId, certificatesData);
          console.log('✅ Certificates uploaded successfully:', uploadedCertificates);
          toast({
            title: "Certificates Uploaded",
            description: `${certificates.length} certificate(s) uploaded successfully.`,
          });
        } catch (certificateError) {
          console.error('❌ Certificate upload error:', certificateError);
          toast({
            title: "Warning",
            description: "Product created but certificate upload failed.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Product Created",
        description: `${Product.name} has been created successfully.`,
      });

      navigate("/admin");

    } catch (error: any) {
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
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col">

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
                {isEdit ? "Edit Product" : "Add New Product"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Information & Pricing */}
                <BasicInfoForm 
                  formData={formData}
                  onInputChange={handleInputChange}
                  categories={categories}
                />

                {/* Metals Section */}
                <MetalsManagement
                  metals={metals}
                  setMetals={setMetals}
                  newMetal={newMetal}
                  setNewMetal={setNewMetal}
                />

                {/* Gemstones Section */}
                <GemstonesManagement
                  gemstones={gemstones}
                  setGemstones={setGemstones}
                  newGemstone={newGemstone}
                  setNewGemstone={setNewGemstone}
                />

                {/* Product Customizations */}
                <ProductCustomizations
                  customizations={customizations}
                  setCustomizations={setCustomizations}
                  newCustomization={newCustomization}
                  setNewCustomization={setNewCustomization}
                />

                {/* Certifications */}
                <SpecificationsForm 
                  onCertificationsChange={setCertifications}
                />

                {/* File Uploads */}
                <FileUploadSection
                  fileState={fileState}
                  onModel3DUpload={handle3DModelUpload}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                  onRemove3DModel={remove3DModel}
                />

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

    </div>
  );
};

export default ProductManagement;
