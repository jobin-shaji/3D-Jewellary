import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Plus, MapPin } from "lucide-react";
import AddressForm from "../../components/AddressForm";
import { Address } from "@/shared/types";

interface ShippingAddressCardProps {
  addresses: Address[];
  addressLoading: boolean;
  selectedAddressId: string;
  isAddressDialogOpen: boolean;
  onAddressSelect: (addressId: string) => void;
  onAddressDialogOpenChange: (open: boolean) => void;
  onAddAddress: (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const ShippingAddressCard: React.FC<ShippingAddressCardProps> = ({
  addresses,
  addressLoading,
  selectedAddressId,
  isAddressDialogOpen,
  onAddressSelect,
  onAddressDialogOpenChange,
  onAddAddress
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addressLoading ? (
          <div className="text-center py-4">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">No addresses found. Please add a new address.</p>
            <Dialog open={isAddressDialogOpen} onOpenChange={onAddressDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <AddressForm
                  onSubmit={onAddAddress}
                  onCancel={() => onAddressDialogOpenChange(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <Label>Select Delivery Address</Label>
              <Dialog open={isAddressDialogOpen} onOpenChange={onAddressDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <AddressForm
                    onSubmit={onAddAddress}
                    onCancel={() => onAddressDialogOpenChange(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <RadioGroup value={selectedAddressId} onValueChange={onAddressSelect}>
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                      <Card className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{address.title}</h4>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.phone}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {address.addressLine1}
                              {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingAddressCard;