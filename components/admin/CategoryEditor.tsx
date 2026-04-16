"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { patchDocumentField } from "@/lib/actions/ProductActions";
import { createCategory } from "@/lib/actions/createCategory";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface CategoryEditorProps {
  documentId: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryEditor({ documentId }: CategoryEditorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing categories and document's current category
  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesData, docData] = await Promise.all([
          client.fetch<Category[]>(
            `*[_type == "category"] | order(title asc) { _id, title, "slug": slug.current }`
          ),
          client.fetch<{ category?: { _ref: string } } | null>(
            `*[_id == $id][0]{ category }`,
            { id: documentId }
          ),
        ]);

        setCategories(categoriesData || []);
        if (docData?.category) {
          setSelectedCategoryId(docData.category._ref);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [documentId]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    patchDocumentField(documentId, "category", {
      _type: "reference",
      _ref: categoryId,
    }).catch((err) => console.error("Failed to update category:", err));
  };

  const handleCreateCategory = async () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const slug = slugify(trimmed);
    const categoryExists = categories.some(
      (c) => c.slug === slug || c.title.toLowerCase() === trimmed.toLowerCase()
    );

    if (categoryExists) {
      setCustomInput("");
      return;
    }

    setIsCreating(true);
    try {
      const newCategory = await createCategory({ title: trimmed, slug });
      setCategories([...categories, newCategory]);
      handleSelectCategory(newCategory._id);
      setCustomInput("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCategoryTitle = categories.find(
    (c) => c._id === selectedCategoryId
  )?.title;

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-3">
      {/* Existing categories */}
      <div className="max-h-[200px] overflow-y-auto space-y-2">
        {categories.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            No categories yet. Create one below.
          </p>
        ) : (
          categories.map((category) => {
            const isSelected = selectedCategoryId === category._id;
            return (
              <button
                key={category._id}
                type="button"
                onClick={() => handleSelectCategory(category._id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg border transition-all",
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-500"
                )}
              >
                <span className="text-sm font-medium">{category.title}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Create new category */}
      <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Add New Category
        </p>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateCategory();
              }
            }}
            placeholder="Enter category name..."
            disabled={isCreating}
            className="h-9 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreateCategory}
            disabled={!customInput.trim() || isCreating}
            className="h-9 shrink-0 px-3"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Selected category badge */}
      {selectedCategoryTitle && (
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Selected
          </p>
          <Badge className="gap-2">
            {selectedCategoryTitle}
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId(null);
                patchDocumentField(documentId, "category", null).catch((err) =>
                  console.error("Failed to clear category:", err)
                );
              }}
              className="ml-1 rounded-full p-0.5 hover:bg-white/25"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}
