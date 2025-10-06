import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Bell } from "lucide-react";

const NotificationsTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Notification Preferences</CardTitle>
      <CardDescription>
        Choose how you want to be notified
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="font-medium">Order Updates</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Get notified about order status changes
            </p>
          </div>
          <input type="checkbox" defaultChecked className="toggle" />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-medium">Marketing Emails</span>
            <p className="text-sm text-muted-foreground">
              Receive emails about new products and promotions
            </p>
          </div>
          <input type="checkbox" className="toggle" />
        </div>
        <Button>Save Preferences</Button>
      </div>
    </CardContent>
  </Card>
);

export default NotificationsTab;
