"use client";

import { Suspense, use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ExternalLink,
  Edit2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  StatusSelect,
  AddressEditor,
  PublishButton,
  RevertButton,
} from "@/components/admin";
import { formatPrice, formatDate } from "@/lib/utils";
import { client } from "@/sanity/lib/client";

interface OrderDetail {
  _id: string;
  orderNumber: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  stripePaymentId: string | null;
  address: {
    phone: string | null;
    line1: string;
    city: string;
    state: string;
  } | null;
  items: Array<{
    _key: string;
    quantity: number;
    priceAtPurchase: number;
    product: {
      _id: string;
      name: string;
      slug: string;
      image?: { asset: { url: string } } | null;
    } | null;
  }>;
}

async function fetchOrderDetail(id: string): Promise<OrderDetail | null> {
  const query = `*[_type == "order" && _id == $id][0]{
    _id,
    orderNumber,
    email,
    total,
    status,
    createdAt,
    stripePaymentId,
    address{
      phone,
      line1,
      city,
      state
    },
    items[]{
      _key,
      quantity,
      priceAtPurchase,
      selectedSize,
      selectedColor,
      product->{
        _id,
        name,
        "slug": slug.current,
        "image": images[0]{asset->{url}}
      }
    }
  }`;
  return await client.fetch(query, { id });
}

function AddressEditorSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-16" />
    </div>
  );
}

function OrderDetailContent({ id }: { id: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);

  console.log("Fetching order detail for ID:", order);

  useEffect(() => {
    fetchOrderDetail(id).then((data) => setOrder(data));
  }, [id]);

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {formatDate(order.createdAt, "datetime")}
          </p>
        </div>

        {/* Status and Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Status:
            </span>
            <Suspense fallback={<Skeleton className="h-10 w-[140px]" />}>
              <StatusSelect documentId={id} documentType="order" />
            </Suspense>
          </div>
          <div className="flex items-center gap-2">
            <Suspense fallback={null}>
              <RevertButton documentId={id} documentType="order" />
            </Suspense>
            <Suspense fallback={null}>
              <PublishButton documentId={id} documentType="order" />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* Items */}
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6 sm:py-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Items ({order.items?.length ?? 0})
              </h2>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items?.map((item) => (
                <div
                  key={item._key}
                  className="flex gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 sm:h-20 sm:w-20">
                    {item.product?.image?.asset?.url ? (
                      <Image
                        src={item.product.image.asset.url}
                        alt={item.product.name ?? "Product"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:text-base">
                          {item.product?.name ?? "Unknown Product"}
                        </span>
                        {item.product?.slug && (
                          <Link
                            href={`/products/${item.product.slug}`}
                            target="_blank"
                            className="shrink-0 text-zinc-400 hover:text-zinc-600"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                        Qty: {item.quantity} × {formatPrice(item.priceAtPurchase)}
                      </p>
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.selectedSize && item.selectedColor && <span className="mx-2">•</span>}
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:text-base">
                      {formatPrice((item.priceAtPurchase ?? 0) * (item.quantity ?? 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(order.total)}</span>
              </div>
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-900 dark:text-zinc-100">Total</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Customer</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <p className="break-all text-zinc-900 dark:text-zinc-100">{order.email}</p>
              {order.stripePaymentId && (
                <p className="break-all text-xs text-zinc-500 dark:text-zinc-400">
                  Payment: {order.stripePaymentId}
                </p>
              )}
            </div>
          </div>

          {/* Shipping */}]
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Shipping Address</h2>
              </div>
              <Edit2 className="h-4 w-4 text-zinc-400" />
            </div>
            {order.address?.line1 && (
              <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
                {order.address.phone && <p className="text-zinc-600 dark:text-zinc-300">📞 {order.address.phone}</p>}
                <p className="text-zinc-600 dark:text-zinc-300">
                  {order.address.line1}, {order.address.city}, {order.address.state}
                </p>
              </div>
            )}
            <div className="mt-4">
              <Suspense fallback={<AddressEditorSkeleton />}>
                <AddressEditor documentId={id} documentType="order" />
              </Suspense>
            </div>
          </div>

          {/* Studio link */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Advanced Editing</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              For additional changes, edit this order in Sanity Studio.
            </p>
            <Link
              href={`/studio/structure/order;${id}`}
              target="_blank"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              Open in Studio
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/administrator/orders"
        className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <OrderDetailContent id={id} />
      </Suspense>
    </div>
  );
}