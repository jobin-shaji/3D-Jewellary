import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CreditCard, Shield, Lock } from "lucide-react";

const PaymentTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Payment Methods</CardTitle>
      <CardDescription>
        All payments are processed securely through Razorpay
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* Payment Security Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-6 w-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Secure Payment Processing</h4>
              <p className="text-sm text-green-700">Your payments are protected by Razorpay's industry-leading security</p>
            </div>
          </div>
        </div>

        {/* Available Payment Methods */}
        <div>
          <h4 className="font-medium mb-3">Available Payment Methods</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">Credit/Debit Cards</span>
              </div>
              <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay, American Express</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 bg-blue-600 rounded" />
                <span className="font-medium">UPI</span>
              </div>
              <p className="text-sm text-muted-foreground">GPay, PhonePe, Paytm, BHIM</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 bg-green-600 rounded" />
                <span className="font-medium">Net Banking</span>
              </div>
              <p className="text-sm text-muted-foreground">All major banks supported</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 bg-purple-600 rounded" />
                <span className="font-medium">Wallets</span>
              </div>
              <p className="text-sm text-muted-foreground">Paytm, MobiKwik, Freecharge</p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div>
          <h4 className="font-medium mb-3">Security Features</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-green-600" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span>No card details stored on our servers</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PaymentTab;
