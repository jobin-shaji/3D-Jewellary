import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Product } from "@/shared/types";
import { useMetalPrices } from "@/shared/hooks/useMetalPrices";
import { useEffect } from "react";

interface PriceSummaryProps {
  product: Product;
  onPriceCalculated?: (totalPrice: number) => void;
}

export const PriceSummary = ({ product, onPriceCalculated }: PriceSummaryProps) => {
  const { metalPrices, loading: pricesLoading, getPrice } = useMetalPrices();

  // Calculate metal costs from product.metals array
  const metalCosts = product.metals?.reduce((total, metal) => {
    // Get current price per gram for this metal type and purity
    const metalPrice = getPrice(metal.type, metal.purity);
    if (metalPrice && metal.weight) {
      return total + (metal.weight * metalPrice.pricePerGram);
    }
    return total;
  }, 0) || 0;

  // Calculate gemstone costs from product.gemstones array
  const gemstoneCosts = product.gemstones?.reduce((total, gemstone) => {
    if (gemstone.price && gemstone.count) {
      return total + (gemstone.price * gemstone.count);
    }
    return total;
  }, 0) || 0;

  // Making charges - use the product.price as the base making charges
  const makingCharges = product.price || 0;
  
  // GST rate changed to 3% for jewelry
  const gstRate = 0.03;
  
  // Calculate total from components
  const calculatedPrice = metalCosts + gemstoneCosts + makingCharges;
  
  // Use calculated price if we have metal/gemstone data, otherwise use base price
  const effectiveSubtotal = calculatedPrice;
  const gstAmount = effectiveSubtotal * gstRate;
  const finalTotal = effectiveSubtotal + gstAmount;

  // Check if we have detailed pricing data
  const hasDetailedPricing = (product.metals && product.metals.length > 0) || (product.gemstones && product.gemstones.length > 0);

  // Notify parent component about the calculated price
  useEffect(() => {
    if (onPriceCalculated) {
      onPriceCalculated(Math.round(finalTotal));
    }
  }, [finalTotal, onPriceCalculated]);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pricesLoading && (
          <div className="text-center text-sm text-muted-foreground">
            Loading current prices...
          </div>
        )}
        
        {/* Component Costs */}
        <div className="space-y-3">
          {/* Metal Costs */}
          {product.metals && product.metals.length > 0 && (
            <>
              {product.metals.map((metal, index) => {
                const metalPrice = getPrice(metal.type, metal.purity);
                const currentPrice = metalPrice?.pricePerGram || 0;
                const metalCost = metal.weight ? metal.weight * currentPrice : 0;
                
                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">
                      {metal.type} {metal.purity} ({metal.weight}g @ ₹{currentPrice.toLocaleString()}/g)
                    </span>
                    <span className="font-medium">₹{metalCost.toLocaleString()}</span>
                  </div>
                );
              })}
            </>
          )}
          
          {/* Gemstone Costs */}
          {product.gemstones && product.gemstones.length > 0 && (
            <>
              {product.gemstones.map((gemstone, index) => {
                const gemstoneCost = gemstone.price && gemstone.count ? gemstone.price * gemstone.count : 0;
                
                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">
                      {gemstone.type} ({gemstone.carat}ct) x{gemstone.count}
                    </span>
                    <span className="font-medium">₹{gemstoneCost.toLocaleString()}</span>
                  </div>
                );
              })}
            </>
          )}
          
          {/* Making Charges */}
          {makingCharges > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Making Charges</span>
              <span className="font-medium">₹{makingCharges.toLocaleString()}</span>
            </div>
          )}
          
          {/* Fallback: Base Product Price when no detailed pricing available */}
          {!hasDetailedPricing && (
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-sm text-muted-foreground">Product Price</span>
              <span className="font-medium">₹{(product.price || 0).toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Subtotal */}
        <div className="flex justify-between items-center py-2">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">₹{effectiveSubtotal.toLocaleString()}</span>
        </div>
        
        {/* GST */}
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-sm text-muted-foreground">GST ({(gstRate * 100)}%)</span>
          <span className="font-medium">₹{Math.round(gstAmount).toLocaleString()}</span>
        </div>
        
        <Separator />
        
        {/* Final Total */}
        <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-4">
          <span className="text-lg font-bold">Total Amount</span>
          <span className="text-xl font-bold text-primary">₹{Math.round(finalTotal).toLocaleString()}</span>
        </div>
        
        {/* Price Breakdown Note */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">Price includes:</p>
          <ul className="space-y-1">
            <li>• Material costs (Gold/Silver)</li>
            <li>• Certified gemstones</li>
            <li>• Expert craftsmanship</li>
            <li>• Quality assurance</li>
            <li>• GST as applicable</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceSummary;
