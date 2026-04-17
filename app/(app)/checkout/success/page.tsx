import { redirect } from "next/navigation";
import { SuccessClient } from "./SuccessClient";
import { verifyAndProcessPayment } from "@/lib/actions/checkout";

export const metadata = {
  title: "Order Confirmed | Beauty Couture",
  description: "Your order has been placed successfully",
};

interface SuccessPageProps {
  searchParams: Promise<{ reference?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const reference = params.reference;

  if (!reference) {
    redirect("/");
  }

  const result = await verifyAndProcessPayment(reference);

  if (!result.success) {
    redirect("/");
  }

  // For now, show a simple success message
  // In a real implementation, you'd fetch the order details
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-gray-600">Your order has been processed successfully.</p>
      <p className="text-sm text-gray-500 mt-2">Reference: {reference}</p>
    </div>
  );
}
