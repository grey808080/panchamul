/**
 * Order notification service.
 *
 * Sends a WhatsApp message to the store owner via the WhatsApp Business Cloud API
 * when a new order is placed.
 *
 * Required env vars:
 *   WHATSAPP_API_TOKEN       — Meta Cloud API access token
 *   WHATSAPP_PHONE_NUMBER_ID — Your WhatsApp Business phone number ID
 *   WHATSAPP_OWNER_NUMBER    — Store owner's WhatsApp number (e.g. 9779849401009)
 *
 * If these are not set, the function logs a warning and returns silently —
 * it never throws, so a notification failure never blocks order creation.
 *
 * Alternative: Sparrow SMS (Nepal)
 *   Set SPARROW_SMS_TOKEN and SPARROW_SMS_FROM instead, and use sendSparrowSms().
 */

interface OrderSummary {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  payment_method: string;
  items_count: number;
}

export async function notifyNewOrder(order: OrderSummary): Promise<void> {
  // Try WhatsApp first, fall back to Sparrow SMS
  const whatsappToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ownerNumber = process.env.WHATSAPP_OWNER_NUMBER;

  if (whatsappToken && phoneNumberId && ownerNumber) {
    await sendWhatsAppNotification(order, { whatsappToken, phoneNumberId, ownerNumber });
    return;
  }

  const sparrowToken = process.env.SPARROW_SMS_TOKEN;
  const sparrowFrom = process.env.SPARROW_SMS_FROM;
  const smsTo = process.env.OWNER_PHONE_NUMBER;

  if (sparrowToken && sparrowFrom && smsTo) {
    await sendSparrowSms(order, { sparrowToken, sparrowFrom, smsTo });
    return;
  }

  console.warn('[OrderNotification] No notification credentials configured. Skipping.');
}

async function sendWhatsAppNotification(
  order: OrderSummary,
  config: { whatsappToken: string; phoneNumberId: string; ownerNumber: string }
): Promise<void> {
  const message =
    `🛒 *New Order — ${order.order_number}*\n` +
    `Customer: ${order.customer_name} (${order.customer_phone})\n` +
    `Items: ${order.items_count} | Total: रु ${order.total.toLocaleString('en-IN')}\n` +
    `Payment: ${order.payment_method.replace(/_/g, ' ').toUpperCase()}\n` +
    `View: ${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin/orders`;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: config.ownerNumber,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[WhatsApp notification] Failed:', err);
    }
  } catch (err) {
    console.error('[WhatsApp notification] Error:', err);
  }
}

async function sendSparrowSms(
  order: OrderSummary,
  config: { sparrowToken: string; sparrowFrom: string; smsTo: string }
): Promise<void> {
  const message =
    `New Order ${order.order_number}: ${order.customer_name}, ` +
    `Rs.${order.total}, ${order.payment_method}. Check admin panel.`;

  try {
    const params = new URLSearchParams({
      token: config.sparrowToken,
      from: config.sparrowFrom,
      to: config.smsTo,
      text: message,
    });

    const res = await fetch(
      `https://api.sparrowsms.com/v2/sms/?${params.toString()}`,
      { method: 'GET' }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[Sparrow SMS] Failed:', err);
    }
  } catch (err) {
    console.error('[Sparrow SMS] Error:', err);
  }
}
