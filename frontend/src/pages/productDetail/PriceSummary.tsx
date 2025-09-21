import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface PriceSummaryProps {
  goldWeight?: number;
  goldPricePerGram?: number;
  gemstoneCost?: number;
  makingCharges?: number;
  gstRate?: number;
}

export const PriceSummary = ({
  goldWeight = 5.2,
  goldPricePerGram = 5400,
  gemstoneCost = 8500,
  makingCharges = 3200,
  gstRate = 0.18
}: PriceSummaryProps) => {
  // Price calculations
  const goldCost = goldWeight * goldPricePerGram;
  const subtotal = goldCost + gemstoneCost + makingCharges;
  const gstAmount = subtotal * gstRate;
  const finalTotal = subtotal + gstAmount;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Component Costs */}
        <div className="space-y-3">
          {/* Gold Cost */}
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">
              Gold ({goldWeight}g @ ₹{goldPricePerGram.toLocaleString()}/g)
            </span>
            <span className="font-medium">₹{goldCost.toLocaleString()}</span>
          </div>
          
          {/* Gemstone Cost */}
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Gemstone</span>
            <span className="font-medium">₹{gemstoneCost.toLocaleString()}</span>
          </div>
          
          {/* Making Charges */}
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-sm text-muted-foreground">Making Charges</span>
            <span className="font-medium">₹{makingCharges.toLocaleString()}</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Subtotal */}
        <div className="flex justify-between items-center py-2">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
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