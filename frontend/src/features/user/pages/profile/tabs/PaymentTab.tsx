import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreditCard } from "lucide-react";

const PaymentTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Payment Methods</CardTitle>
      <CardDescription>
        Manage your payment cards and methods
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full">
          Add New Payment Method
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default PaymentTab;
