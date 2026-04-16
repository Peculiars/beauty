"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import { saveProductImages, uploadImageAsset } from "@/lib/actions/imageActions";


interface SanityImageAsset {
  _type: "image";
  _key: string;
  asset: {
    _type: "reference";
    _ref: string;
  };
}

interface ImageUploaderProps {
  documentId: string;
}

export function ImageUploader({ documentId }: ImageUploaderProps) {
  const [images, setImages] = useState<SanityImageAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing images (read-only client is fine here)
  useEffect(() => {
    client
      .fetch<{ images?: SanityImageAsset[] }>(`*[_id == $id][0]{ images }`, {
        id: documentId,
      })
      .then((data) => setImages(data?.images ?? []))
      .catch((err) => console.error("Failed to fetch images:", err))
      .finally(() => setLoading(false));
  }, [documentId]);

  // Upload via server action
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const newImages: SanityImageAsset[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);

        const formData = new FormData();
        formData.append("file", file);

        // Upload via server action (uses writeClient)
        const assetId = await uploadImageAsset(formData);

        newImages.push({
          _type: "image",
          _key: crypto.randomUUID(),
          asset: { _type: "reference", _ref: assetId },
        });
      }

      const updatedImages = [...images, ...newImages];
      await saveProductImages(documentId, updatedImages);
      setImages(updatedImages);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (key: string) => {
    const updated = images.filter((img) => img._key !== key);
    setImages(updated);
    try {
      await saveProductImages(documentId, updated);
    } catch (err) {
      console.error("Failed to remove image:", err);
      setError("Failed to remove image.");
    }
  };

  const handleMoveImage = async (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;

    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);

    setImages(updated);
    try {
      await saveProductImages(documentId, updated);
    } catch (err) {
      console.error("Failed to reorder images:", err);
      setError("Failed to reorder images.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileSelect}
      />

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {uploadProgress ?? "Uploading..."}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </>
        )}
      </Button>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, index) => (
            <ImageThumbnail
              key={img._key}
              image={img}
              index={index}
              isFirst={index === 0}
              total={images.length}
              onRemove={() => handleRemoveImage(img._key)}
              onMoveUp={() => handleMoveImage(index, index - 1)}
              onMoveDown={() => handleMoveImage(index, index + 1)}
              canMoveUp={index > 0}
              canMoveDown={index < images.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 py-10 dark:border-zinc-700">
          <ImageIcon className="mb-2 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No images yet
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
            Click upload to add images
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Thumbnail
// ============================================

interface ImageThumbnailProps {
  image: SanityImageAsset;
  index: number;
  isFirst: boolean;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function ImageThumbnail({
  image,
  isFirst,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ImageThumbnailProps) {
  const ref = image.asset?._ref;

  // Build CDN URL from asset ref: image-{id}-{dimensions}-{format}
  let url: string | null = null;
  if (ref) {
    const parts = ref.split("-");
    // parts: ["image", id, width, height, format]
    if (parts.length >= 4) {
      const id = parts[1];
      const dimensions = `${parts[2]}-${parts[3]}`;
      const format = parts[4] ?? "jpg";
      url = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${id}-${dimensions}.${format}`;
    }
  }

  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800",
        isFirst && "ring-2 ring-blue-500 ring-offset-1"
      )}
    >
      {url ? (
        <Image src={url} alt="" fill className="object-cover" sizes="200px" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <ImageIcon className="h-8 w-8 text-zinc-400" />
        </div>
      )}

      {isFirst && (
        <div className="absolute left-2 top-2 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white">
          Main
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="destructive"
          size="icon"
          className="h-7 w-7"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}