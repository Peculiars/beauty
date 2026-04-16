"use server";

import { client, writeClient } from "@/sanity/lib/client";
import { CUSTOMER_BY_EMAIL_QUERY } from "@/lib/sanity/queries/customers";

/**
 * Gets or creates a customer by email
 * Simplified for Paystack popup approach
 */
export async function getOrCreateCustomer(
  email: string,
  name: string,
  clerkUserId: string
): Promise<{ sanityCustomerId: string }> {
  // First, check if customer already exists in Sanity
  const existingCustomer = await client.fetch(CUSTOMER_BY_EMAIL_QUERY, {
    email,
  });

  if (existingCustomer) {
    // Customer exists, return existing ID
    return {
      sanityCustomerId: existingCustomer._id,
    };
  }

  // Create new customer in Sanity
  const newSanityCustomer = await writeClient.create({
    _type: "customer",
    email,
    name,
    clerkUserId,
    paystackCustomerId: "", // Will be set if needed later
    createdAt: new Date().toISOString(),
  });

  return {
    sanityCustomerId: newSanityCustomer._id,
  };
}
