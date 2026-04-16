"use server";

import { writeClient } from "@/sanity/lib/client";

/**
 * Patch a single field on any document.
 * Called from the useSanityField hook in ProductDetailPage.
 */
export async function patchDocumentField(
  documentId: string,
  field: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
): Promise<void> {
  await writeClient.patch(documentId).set({ [field]: value }).commit();
}

/**
 * Patch name + slug together atomically (used by NameAndSlugEditor).
 */
export async function patchNameAndSlug(
  documentId: string,
  name: string,
  slugCurrent: string
): Promise<void> {
  await writeClient
    .patch(documentId)
    .set({ name, slug: { _type: "slug", current: slugCurrent } })
    .commit();
}