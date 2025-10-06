import { useState, useEffect } from 'react';
import { Address } from '@/shared/types';
import { apiUrl } from '@/shared/lib/api';

interface UseAddressesReturn {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  addAddress: (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Address>;
  updateAddress: (id: string, addressData: Partial<Address>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
}

export const useAddresses = (): UseAddressesReturn => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(apiUrl('/api/addresses'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(data);
    } catch (error: any) {
      console.error('Error fetching addresses:', error);
      setError(error.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> => {
    try {
      setError(null);
      const response = await fetch(apiUrl('/api/addresses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add address');
      }

      const newAddress = await response.json();
      
      // If this is set as default, update other addresses
      if (newAddress.isDefault) {
        setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
      }
      
      setAddresses(prev => [...prev, newAddress]);
      return newAddress;
    } catch (error: any) {
      console.error('Error adding address:', error);
      const errorMessage = error.message || 'Failed to add address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateAddress = async (id: string, addressData: Partial<Address>): Promise<Address> => {
    try {
      setError(null);
      const response = await fetch(apiUrl(`/api/addresses/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update address');
      }

      const updatedAddress = await response.json();
      
      // If this address is set as default, update other addresses
      if (updatedAddress.isDefault) {
        setAddresses(prev => prev.map(addr => 
          addr.id === id ? updatedAddress : { ...addr, isDefault: false }
        ));
      } else {
        setAddresses(prev => prev.map(addr => 
          addr.id === id ? updatedAddress : addr
        ));
      }
      
      return updatedAddress;
    } catch (error: any) {
      console.error('Error updating address:', error);
      const errorMessage = error.message || 'Failed to update address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteAddress = async (id: string): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(apiUrl(`/api/addresses/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete address');
      }

      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (error: any) {
      console.error('Error deleting address:', error);
      const errorMessage = error.message || 'Failed to delete address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const setDefaultAddress = async (id: string): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(apiUrl(`/api/addresses/${id}/default`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set default address');
      }

      // Update all addresses - set the specified one as default and others as non-default
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
    } catch (error: any) {
      console.error('Error setting default address:', error);
      const errorMessage = error.message || 'Failed to set default address';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshAddresses = async (): Promise<void> => {
    await fetchAddresses();
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses
  };
};