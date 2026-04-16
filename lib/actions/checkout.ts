"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { client, writeClient } from "@/sanity/lib/client";
import { PRODUCTS_BY_IDS_QUERY } from "@/lib/sanity/queries/products";
import { ORDER_BY_PAYSTACK_PAYMENT_ID_QUERY } from "@/lib/sanity/queries/orders";


// Types
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutResult {
  success: boolean;
  paymentData?: {
    amount: number;
    email: string;
    reference: string;
    metadata: {
      clerkUserId: string;
      sanityCustomerId: string;
      productIds: string;
      quantities: string;
      deliveryName: string;     // ✅
      deliveryPhone: string;    // ✅
      deliveryAddress: string;  // ✅
      deliveryCity: string;     // ✅
      deliveryState: string;    // ✅
    };
  };
  error?: string;
}

/**
 * Prepares payment data for Paystack popup
 * Validates stock and prices against Sanity before preparing payment
 */
interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

export async function prepareCheckout(
  items: CartItem[],
  deliveryInfo?: DeliveryInfo  // ✅ add this param
): Promise<CheckoutResult>{
  try {
    // 1. Verify user is authenticated
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: "Please sign in to checkout" };
    }

    // 2. Validate cart is not empty
    if (!items || items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    // 3. Fetch current product data from Sanity to validate prices/stock
    const productIds = items.map((item) => item.productId);
    const products = await client.fetch(PRODUCTS_BY_IDS_QUERY, {
      ids: productIds,
    });

    // 4. Validate each item
    const validationErrors: string[] = [];
    const validatedItems: {
      product: (typeof products)[number];
      quantity: number;
    }[] = [];

    for (const item of items) {
      const product = products.find(
        (p: { _id: string }) => p._id === item.productId
      );

      if (!product) {
        validationErrors.push(`Product "${item.name}" is no longer available`);
        continue;
      }

      if ((product.stock ?? 0) === 0) {
        validationErrors.push(`"${product.name}" is out of stock`);
        continue;
      }

      if (item.quantity > (product.stock ?? 0)) {
        validationErrors.push(
          `Only ${product.stock} of "${product.name}" available`
        );
        continue;
      }

      validatedItems.push({ product, quantity: item.quantity });
    }

    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(". ") };
    }

    // 5. Calculate total amount in kobo (Paystack uses kobo, which is 1/100 of NGN)
    const totalAmount = validatedItems.reduce(
      (total, { product, quantity }) => total + (product.price ?? 0) * quantity,
      0
    );
    const amountInKobo = Math.round(totalAmount * 100); // Convert NGN to kobo

    // 6. Get user details
    const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
    const userName =
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || userEmail;

    // 7. Generate unique reference
    const reference = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // 8. Prepare metadata for verification
    const metadata = {
  clerkUserId: userId,
  sanityCustomerId: "",
  productIds: validatedItems.map((i) => i.product._id).join(","),
  quantities: validatedItems.map((i) => i.quantity).join(","),
  deliveryName: deliveryInfo?.name ?? "",        // ✅
  deliveryPhone: deliveryInfo?.phone ?? "",      // ✅
  deliveryAddress: deliveryInfo?.address ?? "",  // ✅
  deliveryCity: deliveryInfo?.city ?? "",        // ✅
  deliveryState: deliveryInfo?.state ?? "",      // ✅
};

    return {
      success: true,
      paymentData: {
        amount: amountInKobo,
        email: userEmail,
        reference,
        metadata,
      },
    };
  } catch (error) {
    console.error("Checkout preparation error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/**
 * Verifies a Paystack payment and processes the order
 */
export async function verifyAndProcessPayment(reference: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify payment with Paystack
    const verificationResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verificationData = await verificationResponse.json();

    if (!verificationData.status || verificationData.data.status !== "success") {
      return { success: false, error: "Payment verification failed" };
    }

    const paymentData = verificationData.data;

    // Extract metadata
    const {
      clerkUserId,
      productIds: productIdsString,
      quantities: quantitiesString,
      deliveryName,     // ✅
      deliveryPhone,    // ✅
      deliveryAddress,  // ✅
      deliveryCity,     // ✅
      deliveryState,    // ✅
    } = paymentData.metadata ?? {};

    if (!clerkUserId || !productIdsString || !quantitiesString) {
      console.error("Missing metadata in payment verification");
      return { success: false, error: "Invalid payment data" };
    }

    // Verify the payment belongs to this user
    if (clerkUserId !== userId) {
      return { success: false, error: "Payment does not belong to this user" };
    }

    const productIds = productIdsString.split(",");
    const quantities = quantitiesString.split(",").map(Number);

    // Check if order already exists (idempotency)
    const existingOrder = await client.fetch(ORDER_BY_PAYSTACK_PAYMENT_ID_QUERY, {
      paystackPaymentId: reference,
    });

    if (existingOrder) {
      return {
        success: true,
        message: "Order already processed",
        orderId: existingOrder._id,
      };
    }

    // Get or create customer (don't always create a new one)
const user = await currentUser();
const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";
const userName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || userEmail;

// Reuse existing customer or create
let existingCustomer = await client.fetch(`*[_type == "customer" && clerkUserId == $clerkUserId][0]`, { clerkUserId });
const customer = existingCustomer ?? await writeClient.create({
  _type: "customer",
  email: userEmail,
  name: userName,
  clerkUserId: userId,
  paystackCustomerId: paymentData.customer?.customer_code || "",
  createdAt: new Date().toISOString(),
});

// Fetch actual product prices for priceAtPurchase
const products = await client.fetch(PRODUCTS_BY_IDS_QUERY, { ids: productIds });

// Build order items with correct individual prices
const orderItems = productIds.map((productId: string, index: number) => {
  const product = products.find((p: { _id: string }) => p._id === productId);
  return {
    _key: `item-${index}`,
    product: {
      _type: "reference" as const,
      _ref: productId,
    },
    quantity: quantities[index],
    priceAtPurchase: product?.price ?? 0, // ✅ individual product price, not total
  };
});

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create order
   const order = await writeClient.create({
  _type: "order",
  orderNumber,
  customer: { _type: "reference", _ref: customer._id },
  clerkUserId,
  email: userEmail,
  items: orderItems,
  total: paymentData.amount / 100,
  status: "paid",
  paystackPaymentId: reference,
  createdAt: new Date().toISOString(),
  address: {                          // ✅ save delivery info
    name: deliveryName ?? "",
    phone: deliveryPhone ?? "",
    line1: deliveryAddress ?? "",
    city: deliveryCity ?? "",
    state: deliveryState ?? "",
  },
});

    // Update stock
    const tx = writeClient.transaction();
      productIds.forEach((productId: string, i: number) => {
        tx.patch(productId, { dec: { stock: quantities[i] } });
    });
      await tx.commit();

    return {
      success: true,
      message: "Payment verified and order processed",
      orderId: order._id,
      orderNumber,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      error: "Failed to verify payment",
    };
  }
}
