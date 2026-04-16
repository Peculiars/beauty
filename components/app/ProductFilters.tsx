"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { SORT_OPTIONS } from "@/lib/constants/filters";
import type { ALL_CATEGORIES_QUERYResult } from "@/sanity.types";

interface ProductFiltersProps {
  categories: ALL_CATEGORIES_QUERYResult;
  products: Array<{ colors?: string[] | null; sizes?: string[] | null }>;
  priceRange: {
    min: number;
    max: number;
  };
}

export function ProductFilters({ categories, products, priceRange }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentColor = searchParams.get("color") ?? "";
  const currentSize = searchParams.get("size") ?? "";
  const currentSort = searchParams.get("sort") ?? "name";
  const urlMinPrice = Number(searchParams.get("minPrice")) || priceRange.min;
  const urlMaxPrice = Number(searchParams.get("maxPrice")) || priceRange.max;
  const currentInStock = searchParams.get("inStock") === "true";

  // Local state for price range (for smooth slider dragging)
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([
    urlMinPrice,
    urlMaxPrice,
  ]);

  // Sync local state when URL changes
  useEffect(() => {
    setSelectedPriceRange([urlMinPrice, urlMaxPrice]);
  }, [urlMinPrice, urlMaxPrice]);

  // Check which filters are active
  const isSearchActive = !!currentSearch;
  const isCategoryActive = !!currentCategory;
  const isColorActive = !!currentColor;
  const isSizeActive = !!currentSize;
  const isPriceActive = urlMinPrice > priceRange.min || urlMaxPrice < priceRange.max;
  const isInStockActive = currentInStock;

  const hasActiveFilters =
    isSearchActive ||
    isCategoryActive ||
    isColorActive ||
    isSizeActive ||
    isPriceActive ||
    isInStockActive;

  // Count active filters
  const activeFilterCount = [
    isSearchActive,
    isCategoryActive,
    isColorActive,
    isSizeActive,
    isPriceActive,
    isInStockActive,
  ].filter(Boolean).length;

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search") as string;
    updateParams({ q: searchQuery || null });
  };

  const handleClearFilters = () => {
    router.push("/", { scroll: false });
  };

  const clearSingleFilter = (key: string) => {
    if (key === "price") {
      updateParams({ minPrice: null, maxPrice: null });
    } else {
      updateParams({ [key]: null });
    }
  };

  const productColors = products
    .flatMap((product) => product.colors ?? [])
    .filter(Boolean);
  const productSizes = products
    .flatMap((product) => product.sizes ?? [])
    .filter(Boolean);

  const availableColors = Array.from(new Set(productColors)).sort(
    (a, b) => a.localeCompare(b),
  );

  const parseSize = (value: string) => {
    const match = value.match(/(\d+)/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  };

  const availableSizes = Array.from(new Set(productSizes)).sort(
    (a, b) => parseSize(a) - parseSize(b),
  );

  // Helper for filter label with active indicator
  const FilterLabel = ({
    children,
    isActive,
    filterKey,
  }: {
    children: React.ReactNode;
    isActive: boolean;
    filterKey: string;
  }) => (
    <div className="mb-2 flex items-center justify-between">
      <span
        className={`block text-sm font-medium ${
          isActive
            ? "text-zinc-900 dark:text-zinc-100"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {children}
        {isActive && (
          <Badge className="ml-2 h-5 bg-amber-500 px-1.5 text-xs text-white hover:bg-amber-500">
            Active
          </Badge>
        )}
      </span>
      {isActive && (
        <button
          type="button"
          onClick={() => clearSingleFilter(filterKey)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          aria-label={`Clear ${filterKey} filter`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Clear Filters - Show at top when active */}
      {hasActiveFilters && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {activeFilterCount}{" "}
              {activeFilterCount === 1 ? "filter" : "filters"} applied
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleClearFilters}
            className="w-full bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Search */}
      <div>
        <FilterLabel isActive={isSearchActive} filterKey="q">
          Search
        </FilterLabel>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            name="search"
            placeholder="Search products..."
            defaultValue={currentSearch}
            className={`flex-1 ${
              isSearchActive
                ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                : ""
            }`}
          />
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Category */}
      <div>
        <FilterLabel isActive={isCategoryActive} filterKey="category">
          Category
        </FilterLabel>
        <Select
          value={currentCategory || "all"}
          onValueChange={(value) =>
            updateParams({ category: value === "all" ? null : value })
          }
        >
          <SelectTrigger
            className={
              isCategoryActive
                ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                : ""
            }
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category._id} value={category.slug ?? ""}>
                {category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Color */}
      <div>
        <FilterLabel isActive={isColorActive} filterKey="color">
          Color
        </FilterLabel>
        <Select
          value={currentColor || "all"}
          onValueChange={(value) =>
            updateParams({ color: value === "all" ? null : value })
          }
        >
          <SelectTrigger
            className={
              isColorActive
                ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                : ""
            }
          >
            <SelectValue placeholder="All Colors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colors</SelectItem>
            {availableColors.map((color) => (
              <SelectItem key={color} value={color}>
                {color}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div>
        <FilterLabel isActive={isSizeActive} filterKey="size">
          Size
        </FilterLabel>
        <Select
          value={currentSize || "all"}
          onValueChange={(value) =>
            updateParams({ size: value === "all" ? null : value })
          }
        >
          <SelectTrigger
            className={
              isSizeActive
                ? "border-amber-500 ring-1 ring-amber-500 dark:border-amber-400 dark:ring-amber-400"
                : ""
            }
          >
            <SelectValue placeholder="All Sizes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {availableSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <FilterLabel isActive={isPriceActive} filterKey="price">
          Price Range: ₦{selectedPriceRange[0]} - ₦{selectedPriceRange[1]}
        </FilterLabel>
        <Slider
          min={priceRange.min}
          max={priceRange.max}
          step={100}
          value={selectedPriceRange}
          onValueChange={(value) => setSelectedPriceRange(value as [number, number])}
          onValueCommit={([min, max]) =>
            updateParams({
              minPrice: min > priceRange.min ? min : null,
              maxPrice: max < priceRange.max ? max : null,
            })
          }
          className={`mt-4 ${isPriceActive ? "[&_[role=slider]]:border-amber-500 [&_[role=slider]]:ring-amber-500" : ""}`}
        />
      </div>

      {/* In Stock Only */}
      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={currentInStock}
            onChange={(e) =>
              updateParams({ inStock: e.target.checked ? "true" : null })
            }
            className="h-5 w-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <span
            className={`text-sm font-medium ${
              isInStockActive
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Show only in-stock
            {isInStockActive && (
              <Badge className="ml-2 h-5 bg-amber-500 px-1.5 text-xs text-white hover:bg-amber-500">
                Active
              </Badge>
            )}
          </span>
        </label>
      </div>

      {/* Sort */}
      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Sort By
        </span>
        <Select
          value={currentSort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
