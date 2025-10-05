import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Product, ProductVariant } from "@/shared/types";
import { useMetalPrices } from "@/shared/hooks/useMetalPrices";
import { useEffect, useState } from "react";

interface PriceSummaryProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
  onPriceCalculated?: (totalPrice: number) => void;
}

export const PriceSummary = ({ product, selectedVariant, onPriceCalculated }: PriceSummaryProps) => {
  const { metalPrices, loading: pricesLoading, getPrice } = useMetalPrices();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [serverData, setServerData] = useState<any | null>(null);

  // Determine which metals to use for calculation - variant metals if variant is selected, otherwise product metals
  const metalsToUse = selectedVariant?.metal || product.metals;

  // Calculate metal costs from metalsToUse array (client-only, not authoritative)
  const metalCosts = metalsToUse?.reduce((total, metal) => {
    // Get current price per gram for this metal type and purity
    const metalPrice = getPrice(metal.type, metal.purity);
    if (metalPrice && metal.weight) {
      return total + (metal.weight * metalPrice.pricePerGram);
    }
    return total;
  }, 0) || 0;

  // Calculate gemstone costs from product.gemstones array
  // Normalize: `gemstone.price` is treated as price-per-item (per count)
  const gemstoneCosts = product.gemstones?.reduce((total, gemstone) => {
    const price = gemstone.price || 0;
    const count = gemstone.count || 0;
    return total + (price * count);
  }, 0) || 0;

  // Making charges - use variant making price if variant is selected, otherwise product making price
  const makingCharges = selectedVariant?.making_price || product.makingPrice || 0;
  
  // GST rate changed to 3% for jewelry
  const gstRate = 0.03;
  
  // Calculate total from components
  const calculatedPrice = metalCosts + gemstoneCosts + makingCharges;
  
  // Use DB snapshot when available (authoritative). Client-side compute is only fallback for display while server data loads.
  const snapshotTotal = typeof product.totalPrice === 'number' ? product.totalPrice : null;
  const effectiveSubtotal = snapshotTotal !== null ? snapshotTotal / (1 + gstRate) : calculatedPrice;
  const gstAmount = snapshotTotal !== null ? snapshotTotal - (snapshotTotal / (1 + gstRate)) : effectiveSubtotal * gstRate;
  const finalTotal = snapshotTotal !== null ? snapshotTotal : effectiveSubtotal + gstAmount;

  // Check if we have detailed pricing data
  const hasDetailedPricing = (metalsToUse && metalsToUse.length > 0) || (product.gemstones && product.gemstones.length > 0);

  // Notify parent component about the calculated price
  useEffect(() => {
    if (onPriceCalculated) {
      onPriceCalculated(Math.round(finalTotal));
    }
  }, [finalTotal, onPriceCalculated]);

  // Fetch server-side computed price (if available) to get authoritative total and timestamp
  async function fetchServerCompute() {
    setLoadingRemote(true);
    try {
      // Send full product payload with selected variant to backend for authoritative compute
      // Persist the computed rounded total back to product snapshot
      const resp = await fetch('/api/metal/compute-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, selectedVariant, persist: true })
      });

      if (!resp.ok) throw new Error('Server compute failed');
      const json = await resp.json();
      if (json && json.success && json.data) {
        setServerData(json.data);
        // Prefer server-provided lastUpdated; if persist occurred backend may not include it, fallback to now
        setLastUpdated(json.data.lastUpdated || new Date().toISOString());
        const rounded = typeof json.data.roundedTotal === 'number' ? json.data.roundedTotal : Math.round(json.data.total || 0);
        if (onPriceCalculated) onPriceCalculated(rounded);
      } else {
        // If server returned no data, clear serverData so UI shows zeros
        setServerData(null);
        setLastUpdated(null);
        if (onPriceCalculated) onPriceCalculated(0);
      }
    } catch (err) {
      console.debug('Server compute unavailable, using client-side calculation', err?.message || err);
    } finally {
      setLoadingRemote(false);
    }
  }

  useEffect(() => {
    // Try server compute on mount and when variant changes
    fetchServerCompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, selectedVariant]);

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
          {metalsToUse && metalsToUse.length > 0 && (
            <>
              {metalsToUse.map((metal, index) => {
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
              <span className="font-medium">₹{(product.makingPrice || 0).toLocaleString()}</span>
            </div>
          )}
        </div>
        
        <Separator />
        
        {/* Subtotal */}
        <div className="flex justify-between items-center py-2">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">₹{(serverData ? serverData.subtotal : effectiveSubtotal).toLocaleString()}</span>
        </div>
        
        {/* GST */}
        <div className="flex justify-between items-center py-2 border-b border-border/30">
          <span className="text-sm text-muted-foreground">GST ({(gstRate * 100)}%)</span>
          <span className="font-medium">₹{Math.round(serverData ? serverData.tax : gstAmount).toLocaleString()}</span>
        </div>
        
        <Separator />
        
        {/* Final Total */}
        <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-4">
          <span className="text-lg font-bold">Total Amount</span>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary">₹{Math.round(serverData ? serverData.total : finalTotal).toLocaleString()}</span>
            <span className="text-xs text-muted-foreground px-2 py-1 border rounded">
              {serverData ? 'Server' : 'Client'}
            </span>
          </div>
        </div>
        
        {/* Price Breakdown Note */}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
        <div className="flex gap-2">
          <button
            className="btn btn-sm"
            onClick={() => fetchServerCompute()}
            disabled={loadingRemote}
          >
            {loadingRemote ? 'Refreshing...' : 'Refresh Price'}
          </button>
        </div>
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
