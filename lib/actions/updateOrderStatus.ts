"use server";

import { writeClient, client } from "@/sanity/lib/client";
import { sendOrderStatusEmail } from "@/lib/email/orderNotifications";

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // First, get the current order details before updating
    const currentOrder = await client.fetch(
      `*[_id == $id][0]{
        orderNumber,
        email,
        total,
        status,
        address
      }`,
      { id: orderId }
    );

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    // Only send email if status is actually changing
    const shouldSendEmail = currentOrder.status !== newStatus;

    // Update the order status
    await writeClient.patch(orderId).set({ status: newStatus }).commit();

    // Send email notification if status changed
    if (shouldSendEmail) {
      try {
        await sendOrderStatusEmail({
          orderNumber: currentOrder.orderNumber,
          customerName: currentOrder.address?.name || "Valued Customer",
          customerEmail: currentOrder.email,
          status: newStatus,
          total: currentOrder.total,
        });
        console.log(`Email notification sent for order ${currentOrder.orderNumber} status change to ${newStatus}`);
      } catch (emailError) {
        // Log email error but don't fail the status update
        console.error("Failed to send email notification:", emailError);
        // You might want to store this in a log or retry queue
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to update order status"
    );
  }
}
