import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { ProductCustomization, Metal, Gemstone ,Category,Product} from "@/shared/types";
import { useAuth } from "@/shared/contexts/auth";
import { type Certification } from "./SpecificationsForm";
import { useFetchProducts } from "@/features/admin/hooks/useFetchProducts";

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
  updateProduct,
  fetchCategories,
  useProductSubmission
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
    makingPrice: Number(formData.price),
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
  const { singleProduct, singleProductLoading, singleProductError, fetchProduct } = useFetchProducts();
  const { uploadImagesWithToast, upload3DModelWithToast, uploadCertificatesWithToast } = useProductSubmission();
  const isEdit = !!id;

  // Initialize form data with empty values
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    category_id: "",
    description: "",
    inStock: true,
    stock_quantity: "0",
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

  // Fetch product data when in edit mode
  useEffect(() => {
    const loadProductForEdit = async () => {
      if (!isEdit || !id) return;
      
      try {
        console.log('Fetching product for edit:', id);
        const productData = await fetchProduct(id);
        console.log('Product data received:', productData);
        
        // Populate form with product data
        setFormData({
          name: productData.name || "",
          price: productData.makingPrice?.toString() || "",
          category_id: productData.category_id?.toString() || "",
          description: productData.description || "",
          inStock: productData.is_active ?? true,
          stock_quantity: productData.stock_quantity?.toString() || "0",
        });

        // Populate metals if available
        if (productData.metals && productData.metals.length > 0) {
          setMetals(productData.metals.map((metal: any, index: number) => ({
            ...metal,
            id: index // Add frontend ID for key prop
          })));
        }

        // Populate gemstones if available
        if (productData.gemstones && productData.gemstones.length > 0) {
          setGemstones(productData.gemstones.map((gemstone: any, index: number) => ({
            ...gemstone,
            id: index // Add frontend ID for key prop
          })));
        }

        // Populate customizations if available
        if (productData.customizations && productData.customizations.length > 0) {
          setCustomizations(productData.customizations);
        }

      } catch (error) {
        console.error('Failed to fetch product for edit:', error);
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadProductForEdit();
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
      const productData = createProductData(formData, metals, gemstones, customizations);

      console.log(isEdit ? 'Updating product with data:' : 'Creating product with data:', productData);

      let product;
      if (isEdit && id) {
        // Update existing product
        const updatedProduct = await updateProduct(id, productData);
        product = updatedProduct.product;
      } else {
        // Create new product
        const createdProduct = await createProduct(productData);
        product = createdProduct.product;
      }

      // Upload files with error handling
      await uploadImagesWithToast(product.id, fileState.imageFiles, isEdit);
      await upload3DModelWithToast(product.id, fileState.model3DFile!, isEdit);
      
      const certificatesData = certificates.map(cert => ({
        name: cert.name,
        file: cert.file!
      }));
      await uploadCertificatesWithToast(product.id, certificatesData, isEdit);      toast({
        title: isEdit ? "Product Updated" : "Product Created",
        description: `${product.name} has been ${isEdit ? 'updated' : 'created'} successfully.`,
      });

      navigate(`/products/${product.id}`);

    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} product. Please try again.`,
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
              {/* Show loading state when fetching product data for edit */}
              {isEdit && singleProductLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading product data...</span>
                </div>
              ) : singleProductError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{singleProductError}</p>
                  <Button onClick={() => navigate("/admin")} variant="outline">
                    Back to Admin Dashboard
                  </Button>
                </div>
              ) : (
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
                        {isEdit ? "Updating Product..." : "Creating Product..."}
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>

    </div>
  );
};

export default ProductManagement;
