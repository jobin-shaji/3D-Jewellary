import { useCallback } from 'react';
import { useToast } from '@/shared/hooks/use-toast';

interface RazorpayOptions {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  userDetails?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Declare Razorpay global type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const { toast } = useToast();

  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const openRazorpay = useCallback(async (options: RazorpayOptions) => {
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      toast({
        title: "Payment Error",
        description: "Failed to load payment gateway. Please try again.",
        variant: "destructive"
      });
      return;
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKeyId) {
      toast({
        title: "Configuration Error",
        description: "Payment gateway not configured properly.",
        variant: "destructive"
      });
      return;
    }

    const paymentOptions = {
      key: razorpayKeyId,
      amount: options.amount, // Amount in paise
      currency: options.currency,
      name: '3D Marketplace',
      description: `Order #${options.orderId}`,
      order_id: options.razorpayOrderId,
      handler: (response: RazorpayResponse) => {
        console.log('Payment successful:', response);
        options.onSuccess({
          ...response,
          orderId: options.orderId
        });
      },
      prefill: {
        name: options.userDetails?.name || '',
        email: options.userDetails?.email || '',
        contact: options.userDetails?.contact || '',
      },
      notes: {
        orderId: options.orderId,
      },
      theme: {
        color: '#3B82F6', // Blue theme
      },
      modal: {
        ondismiss() {
          console.log('Payment cancelled by user');
          options.onFailure({
            error: {
              code: 'PAYMENT_CANCELLED',
              description: 'Payment was cancelled by user',
              source: 'customer',
              step: 'payment_authentication',
              reason: 'user_cancelled'
            }
          });
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(paymentOptions);
      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      options.onFailure(error);
    }
  }, [loadRazorpayScript, toast]);

  return {
    openRazorpay,
    loadRazorpayScript
  };
};

export default useRazorpay;