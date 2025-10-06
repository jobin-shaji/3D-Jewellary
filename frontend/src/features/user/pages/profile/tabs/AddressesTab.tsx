import React, { useState } from 'react';
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/components/ui/alert-dialog";
import { MapPin, Edit, Trash2, Star, Plus, Loader2 } from "lucide-react";
import { useAddresses } from "@/features/user/hooks/useAddresses";
import AddressForm from "@/features/user/components/AddressForm";
import { Address } from "@/shared/types";

const AddressesTab = () => {
  const { addresses, loading, error, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAddAddress = async (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setActionLoading(true);
      await addAddress(addressData);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding address:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAddress = async (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingAddress) return;
    
    try {
      setActionLoading(true);
      await updateAddress(editingAddress.id, addressData);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error updating address:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deletingAddress) return;
    
    try {
      setActionLoading(true);
      await deleteAddress(deletingAddress.id);
      setDeletingAddress(null);
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setActionLoading(true);
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error('Error setting default address:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (showAddForm || editingAddress) {
    return (
      <AddressForm
        address={editingAddress || undefined}
        onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
        onCancel={() => {
          setShowAddForm(false);
          setEditingAddress(null);
        }}
        isLoading={actionLoading}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Addresses</CardTitle>
          <CardDescription>
            Manage your delivery addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading addresses...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No addresses found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first address to get started with orders
                  </p>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <>
                  {addresses.map((address) => (
                    <Card key={address.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">{address.title}</span>
                              {address.isDefault && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p className="font-medium">
                                {address.firstName} {address.lastName}
                              </p>
                              <p>{address.phone}</p>
                              <p>
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </p>
                              <p>
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p>{address.country}</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAddress(address)}
                              disabled={actionLoading}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            {!address.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(address.id)}
                                disabled={actionLoading}
                                className="flex items-center gap-1"
                              >
                                <Star className="h-3 w-3" />
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingAddress(address)}
                              disabled={actionLoading || addresses.length === 1}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => setShowAddForm(true)}
                    disabled={actionLoading}
                  >
                    <Plus className="h-4 w-4" />
                    Add New Address
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAddress} onOpenChange={() => setDeletingAddress(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the address "{deletingAddress?.title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Address'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddressesTab;
