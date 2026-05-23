"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { client } from "@/sanity/lib/client";
import { PRODUCTS_BY_IDS_QUERY } from "@/lib/sanity/queries/products";
import type { CartItem } from "@/lib/store/cart-store";

export interface StockInfo {
  productId: string;
  currentStock: number;
  isOutOfStock: boolean;
  exceedsStock: boolean;
  availableQuantity: number;
}

export type StockMap = Map<string, StockInfo>;

interface UseCartStockReturn {
  stockMap: StockMap;
  isLoading: boolean;
  hasStockIssues: boolean;
  refetch: () => void;
}

/**
 * Fetches current stock levels for cart items
 * Returns stock info map and loading state
 */
export function useCartStock(items: CartItem[]): UseCartStockReturn {
  const [stockMap, setStockMap] = useState<StockMap>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Memoize unique product IDs to use as stable dependency
  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.productId))),
    [items]
  );

  const fetchStock = useCallback(async () => {
    if (items.length === 0) {
      setStockMap(new Map());
      return;
    }

    setIsLoading(true);

    try {
      const products = await client.fetch(PRODUCTS_BY_IDS_QUERY, {
        ids: productIds,
      });

      const quantityByProduct = new Map<string, number>();

      for (const item of items) {
        const currentTotal = quantityByProduct.get(item.productId) ?? 0;
        quantityByProduct.set(item.productId, currentTotal + item.quantity);
      }

      const newStockMap = new Map<string, StockInfo>();

      for (const productId of productIds) {
        const product = products.find((p: { _id: string }) => p._id === productId);
        const currentStock = product?.stock ?? 0;
        const totalQuantity = quantityByProduct.get(productId) ?? 0;

        newStockMap.set(productId, {
          productId,
          currentStock,
          isOutOfStock: currentStock === 0,
          exceedsStock: totalQuantity > currentStock,
          availableQuantity: Math.min(totalQuantity, currentStock),
        });
      }

      setStockMap(newStockMap);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setIsLoading(false);
    }
  }, [items, productIds]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const hasStockIssues = Array.from(stockMap.values()).some(
    (info) => info.isOutOfStock || info.exceedsStock
  );

  return {
    stockMap,
    isLoading,
    hasStockIssues,
    refetch: fetchStock,
  };
}
