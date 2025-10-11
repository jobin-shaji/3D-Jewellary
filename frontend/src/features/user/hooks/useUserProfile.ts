import { useState } from 'react';
import { apiUrl } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { User } from '@/shared/types';

interface UpdateProfileData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/users/profile'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch profile",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: UpdateProfileData) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const responseData = await response.json();
      setUser(responseData.user);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      return responseData.user;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      const errorMessage = error.message || "Failed to update profile";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return {
    user,
    loading,
    updating,
    fetchUserProfile,
    updateUserProfile,
    setUser
  };
};