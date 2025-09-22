import React, { useState } from 'react';
import { useMetalPrices } from '@/shared/hooks/useMetalPrices';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';

export const MetalPriceExample: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPurity, setSelectedPurity] = useState<string>('');
  
  // Use the hook with filters
  const { 
    metalPrices, 
    availableOptions, 
    loading, 
    error, 
    refreshPrices, 
    getPrice,
    getPricesByType 
  } = useMetalPrices({ 
    type: selectedType || undefined, 
    purity: selectedPurity || undefined 
  });

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSelectedPurity(''); // Reset purity when type changes
  };

  const availablePurities = selectedType 
    ? availableOptions.find(option => option.type === selectedType)?.purities || []
    : [];

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Metal Price Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metal Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Metal Type</label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select metal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {availableOptions.map((option) => (
                  <SelectItem key={option.type} value={option.type}>
                    {option.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purity Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Purity</label>
            <Select 
              value={selectedPurity} 
              onValueChange={setSelectedPurity}
              disabled={!selectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedType ? "Select type first" : "Select purity"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Purities</SelectItem>
                {availablePurities.map((purity) => (
                  <SelectItem key={purity} value={purity}>
                    {purity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => refreshPrices({ type: selectedType || undefined, purity: selectedPurity || undefined })}>
            Refresh Prices
          </Button>
        </CardContent>
      </Card>

      {/* Loading and Error States */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading metal prices...</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">Error: {error}</div>
          </CardContent>
        </Card>
      )}

      {/* Price Results */}
      {!loading && metalPrices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metalPrices.map((price, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{price.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{price.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Purity:</span>
                    <span className="font-medium">{price.purity} ({price.purityPercentage}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Gram:</span>
                    <span className="font-medium">${price.pricePerGram.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Gram:</span>
                    <span className="font-medium">₹{price.pricePerGram.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span className={`font-medium ${price.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {price.change >= 0 ? '+' : ''}{price.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Updated: {new Date(price.lastUpdated).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Source: {price.source}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Demo Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Available API Endpoints:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><code>GET /api/metal-prices/prices</code> - Get all metal prices</li>
              <li><code>GET /api/metal-prices/prices?type=Gold</code> - Get all Gold prices</li>
              <li><code>GET /api/metal-prices/prices?type=Gold&purity=18k</code> - Get specific Gold 18k price</li>
              <li><code>GET /api/metal-prices/types</code> - Get available types and purities</li>
              <li><code>GET /api/metal-prices/prices/Gold/18k</code> - Legacy endpoint for specific price</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Hook Usage Examples:</h4>
            <pre className="text-sm bg-gray-100 p-2 rounded">
{`// Get all prices
const { metalPrices } = useMetalPrices();

// Get only Gold prices
const { metalPrices } = useMetalPrices({ type: 'Gold' });

// Get specific Gold 18k price
const { metalPrices } = useMetalPrices({ type: 'Gold', purity: '18k' });

// Get specific price programmatically
const goldPrice = getPrice('Gold', '18k');

// Get all prices for a type
const allGoldPrices = getPricesByType('Gold');`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetalPriceExample;