"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/sanity/lib/client";

interface Address {
  name?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
}

interface AddressEditorProps {
  documentId: string;
  documentType?: string; // Optional, can be used for future extensions
}

export function AddressEditor({ documentId }: AddressEditorProps) {
  const [address, setAddress] = useState<Address>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await client.fetch(
          `*[_id == $id][0]{address}`,
          { id: documentId }
        );
        setAddress(data?.address || {});
      } catch (err) {
        console.error("Failed to fetch address:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [documentId]);

  // ✅ Handle input change
  const handleChange = (field: keyof Address, value: string) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Save to Sanity
  const handleSave = async () => {
    setSaving(true);
    try {
      await client
        .patch(documentId)
        .set({ address })
        .commit();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-500 dark:text-zinc-400">
          Full Name
        </Label>
        <Input
          value={address.name ?? ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="John Doe"
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-500 dark:text-zinc-400">
          Phone Number
        </Label>
        <Input
          value={address.phone ?? ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="08012345678"
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-500 dark:text-zinc-400">
          Street Address
        </Label>
        <Input
          value={address.line1 ?? ""}
          onChange={(e) => handleChange("line1", e.target.value)}
          placeholder="12 Adeola Odeku Street"
          className="h-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500 dark:text-zinc-400">
            City
          </Label>
          <Input
            value={address.city ?? ""}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Lagos"
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500 dark:text-zinc-400">
            State
          </Label>
          <Input
            value={address.state ?? ""}
            onChange={(e) => handleChange("state", e.target.value)}
            placeholder="Lagos"
            className="h-9"
          />
        </div>
      </div>

      {/* ✅ Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full h-10 rounded-lg bg-black text-white text-sm"
      >
        {saving ? "Saving..." : "Save Address"}
      </button>
    </div>
  );
}