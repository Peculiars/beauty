import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
}

export async function sendOrderStatusEmail(data: OrderEmailData) {
  const { orderNumber, customerName, customerEmail, status, total } = data;

  let subject: string;
  let htmlContent: string;

  switch (status) {
    case "paid":
      subject = `Payment Received - Order ${orderNumber}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Payment Received!</h1>
          <p>Dear ${customerName},</p>
          <p>Thank you for your payment! We have successfully received your payment for order <strong>${orderNumber}</strong>.</p>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li>Order Number: ${orderNumber}</li>
            <li>Total Amount: ₦${total.toLocaleString('en-NG')}</li>
            <li>Status: Payment Confirmed</li>
          </ul>
          <p>Your order is now being processed. We'll send you another update when your order ships.</p>
          <p>Thank you for shopping with us!</p>
          <p>Best regards,<br>Meenah Fashion Room Team</p>
        </div>
      `;
      break;

    case "shipped":
      subject = `Order Shipped - ${orderNumber}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Your Order is on the Way!</h1>
          <p>Dear ${customerName},</p>
          <p>Great news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.</p>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li>Order Number: ${orderNumber}</li>
            <li>Total Amount: ₦${total.toLocaleString('en-NG')}</li>
            <li>Status: Shipped</li>
          </ul>
          <p>You'll receive a tracking number soon if available. We'll send you another update when your order is delivered.</p>
          <p>Thank you for choosing Meenah Fashion Room!</p>
          <p>Best regards,<br>Meenah Fashion Room Team</p>
        </div>
      `;
      break;

    case "delivered":
      subject = `Order Delivered - ${orderNumber}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Order Delivered Successfully!</h1>
          <p>Dear ${customerName},</p>
          <p>Your order <strong>${orderNumber}</strong> has been successfully delivered!</p>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li>Order Number: ${orderNumber}</li>
            <li>Total Amount: ₦${total.toLocaleString('en-NG')}</li>
            <li>Status: Delivered</li>
          </ul>
          <p>We hope you love your new items! If you have any questions or concerns, please don't hesitate to contact us.</p>
          <p>Thank you for shopping with Meenah Fashion Room. We look forward to serving you again!</p>
          <p>Best regards,<br>Meenah Fashion Room Team</p>
        </div>
      `;
      break;

    case "cancelled":
      subject = `Order Cancelled - ${orderNumber}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Order Cancelled</h1>
          <p>Dear ${customerName},</p>
          <p>We're sorry to inform you that your order <strong>${orderNumber}</strong> has been cancelled.</p>
          <p><strong>Order Details:</strong></p>
          <ul>
            <li>Order Number: ${orderNumber}</li>
            <li>Total Amount: ₦${total.toLocaleString('en-NG')}</li>
            <li>Status: Cancelled</li>
          </ul>
          <p>If this cancellation was unexpected or if you have any questions, please contact our customer service team immediately.</p>
          <p>Any payments made will be refunded to your original payment method within 3-5 business days.</p>
          <p>We apologize for any inconvenience this may have caused.</p>
          <p>Best regards,<br>Meenah Fashion Room Team</p>
        </div>
      `;
      break;

    default:
      return; // Don't send email for unknown statuses
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Meenah Fashion Room <orders@meenahfashionroom.com>",
      to: [customerEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    console.log(`Email sent successfully for order ${orderNumber} status: ${status}`);
    return data;
  } catch (error) {
    console.error("Email service error:", error);
    throw error;
  }
}