import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Product, ProductVariant } from "@/shared/types";

interface ProductSpecificationsProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
}

export const ProductSpecifications = ({ product, selectedVariant }: ProductSpecificationsProps) => {
  // Determine which metals to display - variant metals if variant is selected, otherwise product metals
  const metalsToDisplay = selectedVariant?.metal || product.metals;

  return (
    <div className="space-y-8">
      {/* Metal Information */}
      {metalsToDisplay && metalsToDisplay.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold mb-4">
            Metal Details
            {selectedVariant && (
              <span className="text-sm text-muted-foreground ml-2">
                (from selected variant: {selectedVariant.name})
              </span>
            )}
          </h4>
          <div className="space-y-4">
            {metalsToDisplay.map((metal, index) => (
              <div key={index} className="border-b border-primary/20 pb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Type</span>
                    <p className="font-semibold text-foreground">{metal.type}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Purity</span>
                    <p className="font-semibold text-foreground">{metal.purity}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Weight</span>
                    <p className="font-semibold text-foreground">{metal.weight}g</p>
                  </div>
                  {metal.color && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Color</span>
                      <p className="font-semibold text-foreground">{metal.color}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gemstone Information */}
      {product.gemstones && product.gemstones.length > 0 && (
        <div>
          <h4 className="text-xl font-semibold mb-4">Gemstone Details</h4>
          <div className="space-y-4">
            {product.gemstones.map((gemstone, index) => (
              <div key={index} className="border-b border-primary/20 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <h5 className="text-lg font-semibold text-primary">
                    {gemstone.type} × {gemstone.count}
                  </h5>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Carat</span>
                    <p className="font-semibold text-foreground">{gemstone.carat}ct</p>
                  </div>
                  {gemstone.color && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Color</span>
                      <p className="font-semibold text-foreground">{gemstone.color}</p>
                    </div>
                  )}
                  {gemstone.clarity && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Clarity</span>
                      <p className="font-semibold text-foreground">{gemstone.clarity}</p>
                    </div>
                  )}
                  {gemstone.shape && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Shape</span>
                      <p className="font-semibold text-foreground">{gemstone.shape}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Specifications */}
      <div>
        <h4 className="text-xl font-semibold mb-4">General Information</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="font-medium text-muted-foreground">Category</span>
            <span className="font-medium">{product.category?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="font-medium text-muted-foreground">Availability</span>
            <Badge variant={selectedVariant ? (selectedVariant.stock_quantity > 0 ? "secondary" : "destructive") : (product.stock_quantity > 0 ? "secondary" : "destructive")}>
              {selectedVariant ? (selectedVariant.stock_quantity > 0 ? 'Available' : 'Currently Unavailable') : (product.stock_quantity > 0 ? 'Available' : 'Currently Unavailable')}
            </Badge>
          </div>
          {product.certificates && product.certificates.length > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-muted-foreground">Certificates</span>
              <span className="font-medium text-right">
                {product.certificates.map(cert => cert.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Care Instructions */}
      <div>
        <h4 className="text-xl font-semibold mb-4">Care Instructions</h4>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2 text-sm">
              <p className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span>Store in a soft cloth pouch or jewelry box</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span>Clean gently with a soft brush and mild soap</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span>Avoid exposure to harsh chemicals</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span>Remove before swimming or exercising</span>
              </p>
              <p className="flex items-start space-x-2">
                <span className="text-primary mt-1">•</span>
                <span>Professional cleaning recommended annually</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductSpecifications;
