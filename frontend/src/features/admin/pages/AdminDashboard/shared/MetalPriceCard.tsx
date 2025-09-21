import { Card } from "@/shared/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetalPriceCardProps {
  metal: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export const MetalPriceCard = ({ metal, price, change, changePercent }: MetalPriceCardProps) => {
  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const formatMetalPrice = (price: number) => {
    return `₹${price.toFixed(2)}/oz`;
  };

  return (
    <Card className="p-3 min-w-[140px]">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            metal === 'Gold' ? 'bg-yellow-500' : 
            metal === 'Silver' ? 'bg-gray-400' :
            metal === 'Platinum' ? 'bg-gray-600' : 'bg-gray-400'
          }`} />
          <span className="font-medium text-sm">{metal}</span>
        </div>
        {getPriceChangeIcon(change)}
      </div>
      <div className="mt-1">
        <div className="font-bold text-lg">
          {formatMetalPrice(price)}
        </div>
        <div className={`text-xs flex items-center space-x-1 ${getPriceChangeColor(change)}`}>
          <span>{change >= 0 ? '+' : ''}{change.toFixed(2)}</span>
          <span>({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    </Card>
  );
};
