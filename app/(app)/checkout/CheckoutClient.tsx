"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingBag, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckoutButton } from "@/components/app/CheckoutButton";
import { formatPrice } from "@/lib/utils";
import {
  useCartItems,
  useTotalPrice,
  useTotalItems,
} from "@/lib/store/cart-store-provider";
import { useCartStock } from "@/lib/hooks/useCartStock";

interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

function DeliveryForm({
  value,
  onChange,
}: {
  value: DeliveryInfo;
  onChange: (info: DeliveryInfo) => void;
}) {
  const handleChange = (field: keyof DeliveryInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [field]: e.target.value });
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Delivery Information
        </h2>
      </div>
      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. John Doe"
            value={value.name}
            onChange={handleChange("name")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. 08012345678"
            value={value.phone}
            onChange={handleChange("phone")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
          <Input
            id="address"
            type="text"
            placeholder="e.g. 12 Adeola Odeku Street"
            value={value.address}
            onChange={handleChange("address")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g. Lagos"
              value={value.city}
              onChange={handleChange("city")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
            <Input
              id="state"
              type="text"
              placeholder="e.g. Lagos"
              value={value.state}
              onChange={handleChange("state")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutClient() {
  const items = useCartItems();
  const totalPrice = useTotalPrice();
  const totalItems = useTotalItems();
  const { stockMap, isLoading, hasStockIssues } = useCartStock(items);

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const isDeliveryComplete =
    deliveryInfo.name.trim() !== "" &&
    deliveryInfo.phone.trim() !== "" &&
    deliveryInfo.address.trim() !== "" &&
    deliveryInfo.city.trim() !== "" &&
    deliveryInfo.state.trim() !== "";

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600" />
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Your cart is empty
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Add some items to your cart before checking out.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Checkout
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Cart Items */}
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Order Summary ({totalItems} items)
              </h2>
            </div>

            {hasStockIssues && !isLoading && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>Some items have stock issues. Please update your cart before proceeding.</span>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                <span className="ml-2 text-sm text-zinc-500">Verifying stock...</span>
              </div>
            )}

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((item) => {
                const stockInfo = stockMap.get(item.productId);
                const hasIssue = stockInfo?.isOutOfStock || stockInfo?.exceedsStock;

                return (
                  <div
                    key={item.id}
                    className={`flex gap-4 px-6 py-4 ${hasIssue ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-400">No image</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Qty: {item.quantity}</p>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span className="mx-2">•</span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </p>
                        )}
                        {stockInfo?.isOutOfStock && (
                          <p className="mt-1 text-sm font-medium text-red-600">Out of stock</p>
                        )}
                        {stockInfo?.exceedsStock && !stockInfo.isOutOfStock && (
                          <p className="mt-1 text-sm font-medium text-amber-600">Only {stockInfo.currentStock} available</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(item.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-zinc-500">{formatPrice(item.price)} each</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Form */}
          <DeliveryForm value={deliveryInfo} onChange={setDeliveryInfo} />
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Payment Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Shipping</span>
                <span className="text-zinc-900 dark:text-zinc-100">Calculated at checkout</span>
              </div>
              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-zinc-900 dark:text-zinc-100">Total</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Delivery summary preview */}
            {isDeliveryComplete && (
              <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">Delivering to:</p>
                <p className="mt-1 font-medium text-zinc-800 dark:text-zinc-200">{deliveryInfo.name}</p>
                <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                  {deliveryInfo.address}, {deliveryInfo.city}, {deliveryInfo.state}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">{deliveryInfo.phone}</p>
              </div>
            )}

            {!isDeliveryComplete && (
              <p className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400">
                Please fill in your delivery information
              </p>
            )}

            <div className="mt-4">
              <CheckoutButton
                disabled={hasStockIssues || isLoading || !isDeliveryComplete}
                deliveryInfo={deliveryInfo}
              />
            </div>

            <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
              You&apos;ll be redirected to Paystack&apos;s secure checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}