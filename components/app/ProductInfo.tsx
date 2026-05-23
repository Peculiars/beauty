"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/app/AddToCartButton";
import { CheckoutButton } from "@/components/app/CheckoutButton";
import { StockBadge } from "@/components/app/StockBadge";
import { formatPrice } from "@/lib/utils";
import type { PRODUCT_BY_SLUG_QUERYResult } from "@/sanity.types";

interface ProductInfoProps {
  product: NonNullable<PRODUCT_BY_SLUG_QUERYResult>;
}

type ProductWithOptions = NonNullable<PRODUCT_BY_SLUG_QUERYResult> & {
  sizes?: string[] | null;
  colors?: string[] | null;
};

export function ProductInfo({ product }: { product: ProductWithOptions }) {
  const imageUrl = product.images?.[0]?.asset?.url;
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : product.color ?? null,
  );

  return (
    <div className="flex flex-col">
      {/* Category */}
      {product.category && (
        <Link
          href={`/?category=${product.category.slug}`}
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {product.category.title}
        </Link>
      )}

      {/* Title */}
      <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {product.name}
      </h1>

      {/* Price */}
      <p className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {formatPrice(product.price)}
      </p>

      {/* Description */}
      {product.description && (
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          {product.description}
        </p>
      )}

      {/* Stock, Add to Cart, Checkout */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <StockBadge productId={product._id} stock={product.stock ?? 0} />

          {/* Size selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="text-sm text-zinc-500 dark:text-zinc-400">Size</label>
              <select
                value={selectedSize ?? ""}
                onChange={(e) => setSelectedSize(e.target.value ?? null)}
                className="mt-1 w-full rounded-md border p-2"
              >
                {product.sizes.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="text-sm text-zinc-500 dark:text-zinc-400">Color</label>
              <select
                value={selectedColor ?? ""}
                onChange={(e) => setSelectedColor(e.target.value ?? null)}
                className="mt-1 w-full rounded-md border p-2"
              >
                {product.colors.map((c: string) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <AddToCartButton
            productId={product._id}
            name={product.name ?? "Unknown Product"}
            price={product.price ?? 0}
            image={imageUrl ?? undefined}
            stock={product.stock ?? 0}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />
        </div>
        <CheckoutButton
          disabled={product.stock === 0}
          label="Checkout"
        />
      </div>

      {/* Metadata */}
      <div className="mt-6 space-y-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        {product.dimensions && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Size</span>
            <span className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
              {product.dimensions}
            </span>
          </div>
        )}
        {product.color && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Color</span>
            <span className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
              {product.color}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
