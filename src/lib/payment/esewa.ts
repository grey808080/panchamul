/**
 * eSewa Payment Gateway — ePay v2
 *
 * Docs: https://developer.esewa.com.np/pages/Epay-V2
 *
 * Test (UAT):
 *   ESEWA_MERCHANT_CODE=EPAYTEST
 *   ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
 *   ESEWA_FORM_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
 *   ESEWA_STATUS_URL=https://uat.esewa.com.np/api/epay/transaction/status/
 *
 * Production:
 *   ESEWA_FORM_URL=https://epay.esewa.com.np/api/epay/main/v2/form
 *   ESEWA_STATUS_URL=https://epay.esewa.com.np/api/epay/transaction/status/
 *
 * Required env vars:
 *   ESEWA_MERCHANT_CODE   (product_code from eSewa)
 *   ESEWA_SECRET_KEY
 *   NEXT_PUBLIC_SITE_URL  (callback base URL)
 *
 * Optional:
 *   ESEWA_FORM_URL
 *   ESEWA_STATUS_URL
 */

import { createHmac, timingSafeEqual } from 'crypto';

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE ?? 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY ?? '';
const ESEWA_FORM_URL =
  process.env.ESEWA_FORM_URL ??
  'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_STATUS_URL =
  process.env.ESEWA_STATUS_URL ??
  'https://uat.esewa.com.np/api/epay/transaction/status/';

const REQUEST_SIGNED_FIELDS = 'total_amount,transaction_uuid,product_code';

export interface EsewaPaymentFields {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export interface EsewaCallbackData {
  transaction_code?: string;
  status: string;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  signature: string;
  signed_field_names: string;
  success_url?: string;
}

export interface EsewaStatusResponse {
  product_code?: string;
  scd?: string;
  pid?: string;
  totalAmount?: number;
  total_amount?: number;
  status: string;
  refId?: string | null;
  ref_id?: string | null;
}

/**
 * Build HMAC-SHA256 signature (base64) for signed fields in order.
 */
export function generateEsewaSignature(
  signedFieldNames: string,
  fields: Record<string, string | number>,
  secret: string = ESEWA_SECRET_KEY
): string {
  const message = signedFieldNames
    .split(',')
    .map((name) => `${name.trim()}=${fields[name.trim()]}`)
    .join(',');

  return createHmac('sha256', secret).update(message).digest('base64');
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Generate a unique transaction UUID (alphanumeric + hyphen only).
 */
export function generateEsewaTransactionUuid(orderNumber: string): string {
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toLowerCase();
  return `${orderNumber}-${suffix}`;
}

export function buildEsewaPaymentFields(params: {
  amount: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
  productCode?: string;
}): { form_action: string; fields: EsewaPaymentFields } {
  if (!ESEWA_SECRET_KEY) {
    throw new Error('ESEWA_SECRET_KEY is not configured');
  }

  const productCode = params.productCode ?? ESEWA_MERCHANT_CODE;
  const amountStr = params.amount.toFixed(2);

  const unsigned: Record<string, string> = {
    amount: amountStr,
    tax_amount: '0',
    total_amount: amountStr,
    transaction_uuid: params.transactionUuid,
    product_code: productCode,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: REQUEST_SIGNED_FIELDS,
  };

  const signature = generateEsewaSignature(REQUEST_SIGNED_FIELDS, unsigned);

  return {
    form_action: ESEWA_FORM_URL,
    fields: { ...unsigned, signature } as EsewaPaymentFields,
  };
}

export function decodeEsewaCallbackData(data: string): EsewaCallbackData {
  const json = Buffer.from(data, 'base64').toString('utf-8');
  return JSON.parse(json) as EsewaCallbackData;
}

export function verifyEsewaCallbackSignature(decoded: EsewaCallbackData): boolean {
  if (!ESEWA_SECRET_KEY || !decoded.signed_field_names || !decoded.signature) {
    return false;
  }

  const fields: Record<string, string | number> = {};
  for (const name of decoded.signed_field_names.split(',')) {
    const key = name.trim();
    const value = decoded[key as keyof EsewaCallbackData];
    if (value !== undefined && value !== null) {
      fields[key] = value as string | number;
    }
  }

  const expected = generateEsewaSignature(decoded.signed_field_names, fields);
  return safeCompare(expected, decoded.signature);
}

export async function checkEsewaTransactionStatus(
  transactionUuid: string,
  totalAmount: number,
  productCode: string = ESEWA_MERCHANT_CODE
): Promise<EsewaStatusResponse> {
  const url = new URL(ESEWA_STATUS_URL);
  url.searchParams.set('product_code', productCode);
  url.searchParams.set('total_amount', totalAmount.toFixed(2));
  url.searchParams.set('transaction_uuid', transactionUuid);

  const res = await fetch(url.toString(), { method: 'GET' });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`eSewa status check failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<EsewaStatusResponse>;
}

export function getEsewaMerchantCode(): string {
  return ESEWA_MERCHANT_CODE;
}
