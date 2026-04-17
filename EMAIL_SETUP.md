# Email Notifications Setup

This project uses **Resend** for sending automated email notifications when order statuses change.

## Setup Instructions

### 1. Create a Resend Account
1. Go to [resend.com](https://resend.com) and create an account
2. Verify your email address
3. Go to API Keys section and create a new API key

### 2. Configure Environment Variables
Add your Resend API key to `.env.local`:

```env
# Resend (Email Service)
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Verify Domain (Production)
For production use, you'll need to verify your domain in Resend:
1. Go to Domains in your Resend dashboard
2. Add your domain (e.g., `beautycouture.com`)
3. Follow the DNS verification steps
4. Update the `from` email in `lib/email/orderNotifications.ts` to use your verified domain

### 4. Email Templates
The system automatically sends emails for these order status changes:

- **Paid**: "Payment Received" - Confirms payment and order processing
- **Shipped**: "Order is on the Way" - Notifies customer of shipment
- **Delivered**: "Order Delivered Successfully" - Confirms delivery
- **Cancelled**: "Order Cancelled" - Informs of cancellation and refund process

### 5. Testing
To test email functionality:
1. Change an order status in the admin panel (`/administrator/orders`)
2. Check your email inbox (or Resend dashboard for logs)
3. Emails are sent asynchronously and won't block the status update

## Email Content Customization

Edit the email templates in `lib/email/orderNotifications.ts`:
- Subject lines
- HTML content
- Sender email address
- Styling and branding

## Troubleshooting

- **Emails not sending**: Check your Resend API key and account limits
- **Domain verification**: Ensure your domain is verified for production
- **Email delivery**: Check spam folders and Resend logs
- **Rate limits**: Resend has rate limits - check their documentation

## Alternative Email Services

If you prefer a different service, you can easily swap Resend with:
- SendGrid
- Mailgun
- AWS SES
- Postmark

Just update the email service in `lib/email/orderNotifications.ts`.