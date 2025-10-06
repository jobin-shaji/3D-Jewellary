import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Eye, EyeOff, Shield, UserX, Users, Loader2 } from "lucide-react";
import { useUserManagement } from "@/features/admin/hooks/useUserManagement";
import { User, UserRole } from "@/shared/types";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/shared/contexts/auth";

interface UsersTabProps {
  users?: User[]; // Make it optional as we'll use the hook
}

export const UsersTab = ({ users: propsUsers }: UsersTabProps) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { 
    users: hookUsers, 
    loading, 
    error, 
    toggleUserActive, 
    changeUserRole 
  } = useUserManagement();
  
  // State for handling role changes
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentRole: UserRole;
    newRole: UserRole;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    currentRole: 'client',
    newRole: 'client'
  });

  // Use hook users if available, otherwise fall back to props users
  const users = hookUsers.length > 0 ? hookUsers : (propsUsers || []);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin": return "bg-purple-500";
      case "client": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setToggleLoading(userId);
    try {
      await toggleUserActive(userId);
      toast({
        title: "Success",
        description: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to toggle user status",
        variant: "destructive",
      });
    } finally {
      setToggleLoading(null);
    }
  };

  const handleRoleChangeRequest = (userId: string, userName: string, currentRole: UserRole, newRole: UserRole) => {
    if (currentRole === newRole) return; // No change needed
    
    setRoleChangeDialog({
      isOpen: true,
      userId,
      userName,
      currentRole,
      newRole
    });
  };

  const confirmRoleChange = async () => {
    const { userId, newRole } = roleChangeDialog;
    setRoleChangeLoading(userId);
    
    try {
      await changeUserRole(userId, newRole);
      toast({
        title: "Success",
        description: `User role changed to ${newRole} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change user role",
        variant: "destructive",
      });
    } finally {
      setRoleChangeLoading(null);
      setRoleChangeDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const cancelRoleChange = () => {
    setRoleChangeDialog(prev => ({ ...prev, isOpen: false }));
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-red-500">
              <p>Error loading users: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Users ({users.length} users)</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.isActive)}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      {currentUser?.id !== user.id ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            disabled={toggleLoading === user.id}
                          >
                            {toggleLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Select
                            value={user.role}
                            onValueChange={(newRole: UserRole) => handleRoleChangeRequest(user.id, user.name, user.role, newRole)}
                            disabled={roleChangeLoading === user.id}
                          >
                            <SelectTrigger className="w-8 h-8 p-0">
                              <Shield className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="Suspend User (Coming Soon)"
                            className="text-red-500"
                            disabled
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end text-sm text-muted-foreground">
                          Your account
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {loading ? "Loading users..." : "No users found"}
              </h3>
              <p className="text-gray-500">
                {loading ? "Please wait while we fetch user data." : "Registered users will appear here."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={roleChangeDialog.isOpen} onOpenChange={(open) => !open && cancelRoleChange()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <strong>{roleChangeDialog.userName}'s</strong> role from{' '}
              <strong>{roleChangeDialog.currentRole}</strong> to <strong>{roleChangeDialog.newRole}</strong>?
              <br /><br />
              This action will immediately update their permissions and access level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRoleChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRoleChange}
              disabled={roleChangeLoading === roleChangeDialog.userId}
            >
              {roleChangeLoading === roleChangeDialog.userId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                'Confirm Change'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
