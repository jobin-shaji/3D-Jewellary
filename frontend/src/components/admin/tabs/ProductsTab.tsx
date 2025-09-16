import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";

interface ProductsTabProps {
  products: Product[];
  loading: boolean;
  onProductDelete: () => void;
}

export const ProductsTab = ({ products, loading, onProductDelete }: ProductsTabProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteAttempts, setDeleteAttempts] = useState<{[key: string]: number}>({});

  const deleteProduct = async (productId: string, productName: string) => {
    const attempts = deleteAttempts[productId] || 0;
    
    if (attempts === 0) {
      setDeleteAttempts(prev => ({ ...prev, [productId]: 1 }));
      
      toast({
        title: "Confirm Delete",
        description: `Double click delete to permanently delete ${productName}`,
        variant: "destructive",
        duration: 3000,
      });

      setTimeout(() => {
        setDeleteAttempts(prev => ({ ...prev, [productId]: 0 }));
      }, 3000);
      
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });

      setDeleteAttempts(prev => ({ ...prev, [productId]: 0 }));
      onProductDelete();
      
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "out_of_stock": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getProductStatus = (product: Product) => {
    if (!product.is_active) return "inactive";
    if (product.stock_quantity === 0) return "out_of_stock";
    return "active";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Products</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/products")}>
            <Eye className="h-4 w-4 mr-2" />
            View Store
          </Button>
          <Button onClick={() => navigate("/admin/products/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Product Inventory ({products.length} items)</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].image_url}
                            alt={product.images[0].alt_text || product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {product.category?.name || 'Uncategorized'}
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <span className={`${
                        product.stock_quantity === 0 
                          ? 'text-destructive' 
                          : product.stock_quantity < 10 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(getProductStatus(product))}>
                          {getProductStatus(product).replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/products/${product.id}`)}
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteProduct(product.id.toString(), product.name)}
                          title={deleteAttempts[product.id] ? "Click again to confirm delete" : "Delete Product"}
                          className={`${deleteAttempts[product.id] ? 'bg-red-100 text-red-700' : 'text-destructive hover:text-destructive'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first product.</p>
              <Button onClick={() => navigate("/admin/products/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
