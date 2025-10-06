import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { User, Camera } from "lucide-react";

const ProfileTab = ({ user }: { user: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Profile Information</CardTitle>
      <CardDescription>
        Update your personal information and preferences
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar} alt="Profile picture" />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <Button variant="outline">
          <Camera className="h-4 w-4 mr-2" />
          Change Photo
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" defaultValue={user.firstName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" defaultValue={user.lastName} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" defaultValue={user.email} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" defaultValue={user.phone} />
      </div>
      <Button>Save Changes</Button>
    </CardContent>
  </Card>
);

export default ProfileTab;
