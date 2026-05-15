/**
 * Khalti Payment Gateway — v2 ePay API
 *
 * Docs: https://docs.khalti.com/khalti-epayment/
 *
 * Test credentials:
 *   KHALTI_SECRET_KEY=test_secret_key_...  (from Khalti merchant dashboard)
 *   KHALTI_BASE_URL=https://a.khalti.com   (test environment)
 *
 * Production:
 *   KHALTI_BASE_URL=https://khalti.com
 *
 * Required env vars:
 *   KHALTI_SECRET_KEY
 *   KHALTI_BASE_URL          (defaults to test URL if not set)
 *   NEXT_PUBLIC_SITE_URL     (your site's base URL for return_url)
 */

const KHALTI_BASE_URL =
  process.env.KHALTI_BASE_URL ?? 'https://a.khalti.com';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY ?? '';

export interface KhaltiInitiatePayload {
  return_url: string;
  website_url: string;
  amount: number;          // in paisa (NPR × 100)
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: 'Completed' | 'Pending' | 'Initiated' | 'Refunded' | 'Expired' | 'User canceled';
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
  purchase_order_id: string;
  purchase_order_name: string;
}

/**
 * Step 1 — Initiate a Khalti payment.
 * Returns a pidx and a payment_url to redirect the user to.
 */
export async function initiateKhaltiPayment(
  payload: KhaltiInitiatePayload
): Promise<KhaltiInitiateResponse> {
  if (!KHALTI_SECRET_KEY) {
    throw new Error('KHALTI_SECRET_KEY is not configured');
  }

  const res = await fetch(`${KHALTI_BASE_URL}/api/v2/epayment/initiate/`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Khalti initiate failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<KhaltiInitiateResponse>;
}

/**
 * Step 2 — Look up a payment by pidx to verify it completed.
 * Call this in the return_url handler after Khalti redirects back.
 */
export async function lookupKhaltiPayment(
  pidx: string
): Promise<KhaltiLookupResponse> {
  if (!KHALTI_SECRET_KEY) {
    throw new Error('KHALTI_SECRET_KEY is not configured');
  }

  const res = await fetch(`${KHALTI_BASE_URL}/api/v2/epayment/lookup/`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pidx }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Khalti lookup failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<KhaltiLookupResponse>;
}
