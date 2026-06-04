"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartItems, useCartActions } from "@/lib/store/cart-store-provider"; // ✅ add useCartActions
import { prepareCheckout, verifyAndProcessPayment } from "@/lib/actions/checkout"; // ✅ import verify

interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

interface CheckoutButtonProps {
  disabled?: boolean;
  label?: string;
  deliveryInfo?: DeliveryInfo; // ✅ add this
}


declare global {
  interface Window {
    PaystackPop: any;
  }
}

export function CheckoutButton({ disabled, label, deliveryInfo }: CheckoutButtonProps) {
  const router = useRouter();
  const items = useCartItems();
  const { clearCart } = useCartActions(); // ✅ get clearCart from store
  const [isPending, startTransition] = useTransition();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => {
      toast.error("Payment Error", { description: "Failed to load payment system" });
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) document.head.removeChild(existingScript);
    };
  }, []);

  const handleCheckout = () => {
    if (!paystackLoaded) {
      toast.error("Payment Error", { description: "Payment system is still loading. Please try again." });
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await prepareCheckout(items, deliveryInfo);

      if (result.success && result.paymentData) {
        const paystack = window.PaystackPop.setup({
  key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  email: result.paymentData.email,
  amount: result.paymentData.amount,
  ref: result.paymentData.reference,
  metadata: result.paymentData.metadata,

  callback: function (response: any) {
    (async () => {
      setIsVerifying(true);
      try {
        const verification = await verifyAndProcessPayment(response.reference);
        if (verification.success) {
          clearCart();
          toast.success("Order placed!", { description: `Order ${verification.orderNumber} confirmed.` });
          router.push(`/orders/${verification.orderId}`);
        } else {
          toast.error("Order Error", { description: verification.error ?? "Failed to process order" });
        }
      } catch (err) {
        toast.error("Something went wrong", { description: "Please contact support with your payment reference." });
      } finally {
        setIsVerifying(false);
      }
    })();
  },

  onClose: function () {
    toast.info("Payment cancelled");
  },
});

paystack.openIframe();
      } else {
        setError(result.error ?? "Checkout failed");
        toast.error("Checkout Error", { description: result.error ?? "Something went wrong" });
      }
    });
  };

  const buttonText = label ?? "Pay with Paystack";
  const isLoading = isPending || isVerifying;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCheckout}
        disabled={disabled || isLoading || items.length === 0 || !paystackLoaded}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isVerifying ? "Creating order..." : "Processing..."}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {buttonText}
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
    </div>
  );
}