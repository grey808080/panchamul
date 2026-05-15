/**
 * GET /api/payment/esewa/success
 *
 * eSewa redirects here after payment with ?data=<base64-json>.
 */

import { NextRequest } from 'next/server';
import { handleEsewaCallback } from '../_verify';

export async function GET(request: NextRequest) {
  return handleEsewaCallback(request, true);
}
