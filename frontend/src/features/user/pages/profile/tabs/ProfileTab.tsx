import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { User, Mail, Calendar, Shield, Loader2 } from "lucide-react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useToast } from "@/shared/hooks/use-toast";

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileTab = () => {
  const { user, loading, updating, fetchUserProfile, updateUserProfile } = useUserProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    // Validate password fields if changing password
    if (formData.newPassword) {
      // Check if user is Google OAuth user
      if (user?.authProvider === 'google') {
        toast({
          title: "Not Allowed",
          description: "Password cannot be changed for Google-authenticated accounts",
          variant: "destructive"
        });
        return;
      }

      if (!formData.currentPassword) {
        toast({
          title: "Validation Error",
          description: "Current password is required to set a new password",
          variant: "destructive"
        });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "New passwords do not match",
          variant: "destructive"
        });
        return;
      }

      if (formData.newPassword.length < 6) {
        toast({
          title: "Validation Error",
          description: "New password must be at least 6 characters long",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateUserProfile(updateData);
      
      // Reset password fields after successful update
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordFields(false);
      
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Failed to load user profile</p>
          <Button onClick={fetchUserProfile} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and account settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt="Profile picture" />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {user.email}
              </p>
              <p className="text-sm text-muted-foreground flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.authProvider === 'google' ? 'Google Account' : 'Local Account'}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Account Information</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center">
                  <Calendar className="h-3 w-3 mr-2" />
                  Member since: {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  Account Status: {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Password Change Section - Only show for local accounts */}
          {user.authProvider === 'local' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Change Password</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  {showPasswordFields ? 'Cancel' : 'Change Password'}
                </Button>
              </div>

            {showPasswordFields && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            )}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={updating} className="w-full">
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating Profile...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileTab;
