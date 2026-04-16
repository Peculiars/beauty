"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { ArrowLeft, ExternalLink, Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublishButton, RevertButton, ImageUploader, DeleteButton, CategoryEditor } from "@/components/admin";
import { COLORS } from "@/lib/constants/filters";
import { patchDocumentField, patchNameAndSlug } from "@/lib/actions/ProductActions";

// ============================================
// Size systems
// ============================================

const ALPHA_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"];
const NUMERIC_SIZES = Array.from({ length: 42 }, (_, i) => String(i + 8)); // "8" to "49"

// ============================================
// Slug utility
// ============================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================
// Generic field hook — reads with client, writes via server action
// ============================================

function useSanityField<T>(documentId: string, field: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .fetch<T>(`*[_id == $id][0].${field}`, { id: documentId })
      .then((v) => {
        if (v !== undefined && v !== null) setValue(v);
        setLoading(false);
      });
  }, [documentId, field]);

  const update = useCallback(
    (newValue: T) => {
      setValue(newValue);
      patchDocumentField(documentId, field, newValue).catch((err) =>
        console.error(`Failed to update ${field}:`, err)
      );
    },
    [documentId, field]
  );

  return { value, update, loading };
}

// ============================================
// Name + Auto-slug
// ============================================

function NameAndSlugEditor({ documentId }: { documentId: string }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .fetch<{ name?: string; slug?: { current?: string } }>(
        `*[_id == $id][0]{ name, slug }`,
        { id: documentId }
      )
      .then((data) => {
        setName(data?.name ?? "");
        setSlug(data?.slug?.current ?? "");
        setLoading(false);
      });
  }, [documentId]);

  const handleNameChange = (newName: string) => {
    const newSlug = slugify(newName);
    setName(newName);
    setSlug(newSlug);
    patchNameAndSlug(documentId, newName, newSlug).catch(console.error);
  };

  if (loading) return <Skeleton className="h-10 w-full" />;

  return (
    <div className="space-y-1">
      <Input
        value={name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="Product name"
        className="text-base"
      />
      {slug && (
        <p className="pl-1 text-xs text-zinc-400 dark:text-zinc-500">
          URL: <span className="font-mono">/products/{slug}</span>
        </p>
      )}
    </div>
  );
}

// ============================================
// Description
// ============================================

function DescriptionEditor({ documentId }: { documentId: string }) {
  const { value, update, loading } = useSanityField<string>(documentId, "description", "");
  if (loading) return <Skeleton className="h-24" />;
  return (
    <Textarea
      value={value}
      onChange={(e) => update(e.target.value)}
      rows={4}
      placeholder="Describe the product..."
    />
  );
}

// ============================================
// Price
// ============================================

function PriceEditor({ documentId }: { documentId: string }) {
  const { value, update, loading } = useSanityField<number>(documentId, "price", 0);
  const [inputValue, setInputValue] = useState<string>(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    const numValue = parseFloat(input) || 0;
    if (numValue >= 0) {
      update(numValue);
    }
  };

  if (loading) return <Skeleton className="h-10" />;

  const formattedPrice = value > 0 
    ? `₦${value.toLocaleString('en-NG')}`
    : '₦0';

  return (
    <div className="space-y-2">
      <Input
        type="number"
        step="0.01"
        min="0"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter price"
        className="text-base"
      />
      {value > 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Formatted: <span className="font-medium text-zinc-700 dark:text-zinc-300">{formattedPrice}</span>
        </p>
      )}
    </div>
  );
}

// ============================================
// Stock
// ============================================

function StockEditor({ documentId }: { documentId: string }) {
  const { value, update, loading } = useSanityField<number>(documentId, "stock", 0);
  const [inputValue, setInputValue] = useState<string>(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Clear the input if it's 0 so user can type without trailing 0
    if (value === 0) {
      e.target.value = "";
      setInputValue("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setInputValue(input);

    const numValue = parseInt(input) || 0;
    if (numValue >= 0) {
      update(numValue);
    }
  };

  const handleBlur = () => {
    // Ensure we show a proper value
    if (inputValue === "" || isNaN(parseInt(inputValue))) {
      setInputValue("0");
      update(0);
    }
  };

  if (loading) return <Skeleton className="h-10" />;

  return (
    <Input
      type="number"
      min="0"
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="Enter quantity"
      className="text-base"
    />
  );
}

// ============================================
// Multi-Color Selector with custom entry
// ============================================

function ColorsEditor({ documentId }: { documentId: string }) {
  const { value, update, loading } = useSanityField<string[]>(documentId, "colors", []);
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    );
  }

  const selected = value ?? [];
  const presetValues = new Set(COLORS.map((c) => c.value));
  const customSelected = selected.filter((s: any) => !presetValues.has(s));

  const toggle = (colorValue: string) => {
    const next = selected.includes(colorValue)
      ? selected.filter((c) => c !== colorValue)
      : [...selected, colorValue];
    update(next);
  };

  const addCustomColor = () => {
    const trimmed = customInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed || selected.includes(trimmed)) {
      setCustomInput("");
      return;
    }
    update([...selected, trimmed]);
    setCustomInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Preset pills */}
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => {
          const isSelected = selected.includes(color.value);
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => toggle(color.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all select-none",
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500"
              )}
            >
              {isSelected && <Check className="h-3 w-3 shrink-0" />}
              {color.label}
            </button>
          );
        })}
      </div>

      {/* Custom color entry */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomColor(); } }}
          placeholder='Add custom color (e.g. "forest green")...'
          className="h-9 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCustomColor}
          disabled={!customInput.trim()}
          className="h-9 shrink-0 px-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Custom color badges */}
      {customSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 self-center">Custom:</span>
          {customSelected.map((c) => (
            <Badge key={c} variant="secondary" className="gap-1 pr-1 text-xs capitalize">
              {c.replace(/-/g, " ")}
              <button
                type="button"
                onClick={() => toggle(c)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {selected.length} color{selected.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

// ============================================
// Multi-Size Selector with system toggle
// ============================================

function SizesEditor({ documentId }: { documentId: string }) {
  const { value, update, loading } = useSanityField<string[]>(documentId, "sizes", []);
  const [sizeSystem, setSizeSystem] = useState<"alpha" | "numeric">("alpha");

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-14 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const selected = value ?? [];
  const alphaSet = new Set(ALPHA_SIZES);
  const numericSet = new Set(NUMERIC_SIZES);
  const alphaSelected = selected.filter((s) => alphaSet.has(s));
  const numericSelected = selected.filter((s) => numericSet.has(s));
  const currentSizes = sizeSystem === "alpha" ? ALPHA_SIZES : NUMERIC_SIZES;

  const toggle = (sizeValue: string) => {
    const next = selected.includes(sizeValue)
      ? selected.filter((s) => s !== sizeValue)
      : [...selected, sizeValue];
    update(next);
  };

  const clearSystem = (system: "alpha" | "numeric") => {
    const systemSet = system === "alpha" ? alphaSet : numericSet;
    update(selected.filter((s) => !systemSet.has(s)));
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2">
        {(["alpha", "numeric"] as const).map((system) => {
          const label = system === "alpha" ? "S / M / L / XL" : "8 / 10 / 12...";
          const count = system === "alpha" ? alphaSelected.length : numericSelected.length;
          const isActive = sizeSystem === system;
          return (
            <button
              key={system}
              type="button"
              onClick={() => setSizeSystem(system)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-500"
              )}
            >
              {label}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/25 text-white dark:bg-zinc-900/25 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Size grid */}
      <div className="flex flex-wrap gap-2">
        {currentSizes.map((size) => {
          const isSelected = selected.includes(size);
          return (
            <button
              key={size}
              type="button"
              onClick={() => toggle(size)}
              className={cn(
                "min-w-[44px] rounded-md border px-3 py-1.5 text-center text-sm font-medium transition-all select-none",
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500"
              )}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {selected.length > 0 && (
        <div className="space-y-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          {alphaSelected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Letter:
              </span>
              <div className="flex flex-wrap gap-1">
                {ALPHA_SIZES.filter((s) => alphaSelected.includes(s)).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
              <button
                type="button"
                onClick={() => clearSystem("alpha")}
                className="ml-auto shrink-0 text-xs text-zinc-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
          {numericSelected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Numeric:
              </span>
              <div className="flex flex-wrap gap-1">
                {NUMERIC_SIZES.filter((s) => numericSelected.includes(s)).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
              <button
                type="button"
                onClick={() => clearSystem("numeric")}
                className="ml-auto shrink-0 text-xs text-zinc-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Featured
// ============================================

function FeaturedEditor({ documentId }: { documentId: string }) {
  const { value, update, loading } = useSanityField<boolean>(documentId, "featured", false);
  if (loading) return <Skeleton className="h-6 w-11" />;
  return <Switch checked={value} onCheckedChange={update} />;
}

// ============================================
// Store link
// ============================================

function ProductStoreLink({ documentId }: { documentId: string }) {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    client
      .fetch<{ slug?: { current?: string } } | null>(
        `*[_id == $id][0]{ slug }`,
        { id: documentId }
      )
      .then((data) => setSlug(data?.slug?.current ?? null));
  }, [documentId]);

  if (!slug) return null;

  return (
    <Link
      href={`/products/${slug}`}
      target="_blank"
      className="mt-4 flex items-center justify-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      View on store
      <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}

// ============================================
// Page
// ============================================

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: documentId } = use(params);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href="/administrator/inventory"
        className="inline-flex items-center text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Inventory
      </Link>

      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              Product Editor
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Changes save automatically · Publish when ready
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DeleteButton
              documentId={documentId}
              documentType="product"
              redirectTo="/administrator/inventory"
            />
            <RevertButton
              documentId={documentId}
              documentType="product"
              redirectTo="/administrator/inventory"
            />
            <PublishButton
              documentId={documentId}
              documentType="product"
              redirectTo="/administrator/inventory"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">

            {/* Basic Info */}
            <section className="space-y-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Basic Info</h2>
              <div className="space-y-1">
                <Label>Product Name</Label>
                <NameAndSlugEditor documentId={documentId} />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <DescriptionEditor documentId={documentId} />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <CategoryEditor documentId={documentId} />
              </div>
            </section>

            {/* Pricing & Inventory */}
            <section className="space-y-5 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Pricing & Inventory</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Price (₦)</Label>
                  <PriceEditor documentId={documentId} />
                </div>
                <div className="space-y-1">
                  <Label>Stock</Label>
                  <StockEditor documentId={documentId} />
                </div>
              </div>
            </section>

            {/* Colors */}
            <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Available Colors</h2>
              <ColorsEditor documentId={documentId} />
            </section>

            {/* Sizes */}
            <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Available Sizes</h2>
              <SizesEditor documentId={documentId} />
            </section>

            {/* Options */}
            <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Options</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">Featured Product</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Show on homepage and promotions</p>
                </div>
                <FeaturedEditor documentId={documentId} />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Product Images</h2>
              <ImageUploader documentId={documentId} />
              <ProductStoreLink documentId={documentId} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}