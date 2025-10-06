

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import ProfileTab from "./tabs/ProfileTab";
import AddressesTab from "./tabs/AddressesTab";
import PaymentTab from "./tabs/PaymentTab";
import NotificationsTab from "./tabs/NotificationsTab";

const Profile = () => {
  // Mock user data
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/placeholder.svg"
  };

  return (
    <div className="min-h-screen flex flex-col">


      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <ProfileTab user={user} />
            </TabsContent>
            
            <TabsContent value="addresses">
              <AddressesTab />
            </TabsContent>
            
            <TabsContent value="payment">
              <PaymentTab />
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

    </div>
  );
};

export default Profile;
