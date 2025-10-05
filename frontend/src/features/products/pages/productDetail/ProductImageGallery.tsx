import { useState } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/components/ui/dialog";
import { ZoomIn, Box } from "lucide-react";
import { Product3DViewer } from "@/features/products/components/Product3DViewer";
import { Product } from "@/shared/types";

interface ProductImageGalleryProps {
  product: Product;
}

export const ProductImageGallery = ({ product }: ProductImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'3d' | 'image'>(() => 
    product?.model_3d_url ? '3d' : 'image'
  );

  // Use variants to determine layout: if product has multiple variants, show thumbnails below
  // If single variant or no variants, show thumbnails on the left
  const hasMultipleVariants = product.variants && product.variants.length > 1;

  return (
    <div className="space-y-6">
      {hasMultipleVariants ? (
        // Layout with multiple variants: Thumbnails below the main viewer
        <>
          {/* Main Display Area */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {viewMode === '3d' && product.model_3d_url ? (
                // 3D Viewer Display
                <Product3DViewer 
                  modelUrl={product.model_3d_url}
                  productName={product.name}
                  className="h-96 lg:h-[500px]"
                />
              ) : (
                // Image Display with Zoom
                product.images && product.images.length > 0 ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative group cursor-pointer">
                        <img
                          src={product.images[selectedImageIndex]?.image_url}
                          alt={product.images[selectedImageIndex]?.alt_text || product.name}
                          className="w-full h-96 lg:h-[500px] object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <img
                        src={product.images[selectedImageIndex]?.image_url}
                        alt={product.images[selectedImageIndex]?.alt_text || product.name}
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  // Fallback when no images or 3D model
                  <div className="h-96 lg:h-[500px] flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <Box className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No visual content available</p>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
          
          {/* Thumbnail Navigation - Below the main viewer */}
          <div className="w-full border-t pt-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
              {/* 3D Model Thumbnail */}
              {product.model_3d_url && (
                <div className="flex-shrink-0">
                  <Card 
                    className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                      viewMode === '3d' ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setViewMode('3d')}
                  >
                    <CardContent className="p-3 flex items-center justify-center w-20 h-20 bg-muted/30">
                      <Box className="h-6 w-6 text-primary" />
                    </CardContent>
                  </Card>
                  <p className="text-xs text-center mt-1 text-muted-foreground">3D Model</p>
                </div>
              )}
              
              {/* Image Thumbnails */}
              {product.images && product.images.map((image, index) => (
                <div key={image.id} className="flex-shrink-0">
                  <Card 
                    className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                      viewMode === 'image' && selectedImageIndex === index ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                    }`}
                    onClick={() => {
                      setViewMode('image');
                      setSelectedImageIndex(index);
                    }}
                  >
                    <CardContent className="p-1 w-20 h-20 flex items-center justify-center">
                      <img
                        src={image.image_url}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </CardContent>
                  </Card>
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    Image {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Layout without multiple variants: Thumbnails on the left
        <div className="flex gap-4">
          {/* Thumbnail Navigation - Left side */}
          <div className="flex flex-col gap-3 w-24">
            {/* 3D Model Thumbnail */}
            {product.model_3d_url && (
              <Card 
                className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                  viewMode === '3d' ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                }`}
                onClick={() => setViewMode('3d')}
              >
                <CardContent className="p-3 flex items-center justify-center h-20 bg-muted/30">
                  <Box className="h-6 w-6 text-primary" />
                </CardContent>
              </Card>
            )}
            
            {/* Image Thumbnails */}
            {product.images && product.images.map((image, index) => (
              <Card 
                key={image.id}
                className={`cursor-pointer hover:ring-2 hover:ring-primary transition-all border-2 ${
                  viewMode === 'image' && selectedImageIndex === index ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'border-transparent'
                }`}
                onClick={() => {
                  setViewMode('image');
                  setSelectedImageIndex(index);
                }}
              >
                <CardContent className="p-1 h-20 flex items-center justify-center">
                  <img
                    src={image.image_url}
                    alt={image.alt_text || product.name}
                    className="w-full h-full object-cover rounded"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Display Area */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0">
              {viewMode === '3d' && product.model_3d_url ? (
                // 3D Viewer Display
                <Product3DViewer 
                  modelUrl={product.model_3d_url}
                  productName={product.name}
                  className="h-96 lg:h-[500px]"
                />
              ) : (
                // Image Display with Zoom
                product.images && product.images.length > 0 ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative group cursor-pointer">
                        <img
                          src={product.images[selectedImageIndex]?.image_url}
                          alt={product.images[selectedImageIndex]?.alt_text || product.name}
                          className="w-full h-96 lg:h-[500px] object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <img
                        src={product.images[selectedImageIndex]?.image_url}
                        alt={product.images[selectedImageIndex]?.alt_text || product.name}
                        className="w-full h-auto"
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  // Fallback when no images or 3D model
                  <div className="h-96 lg:h-[500px] flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <Box className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No visual content available</p>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};