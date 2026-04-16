"use server";

import { writeClient } from "@/sanity/lib/client";

export async function deleteProduct(documentId: string) {
  const baseId = documentId.replace("drafts.", "");
  await writeClient.delete(baseId);
}