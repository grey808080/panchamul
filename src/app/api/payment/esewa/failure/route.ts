/**
 * GET /api/payment/esewa/failure
 *
 * eSewa redirects here on failure/cancel. May still include ?data= for verification.
 */

import { NextRequest } from 'next/server';
import { handleEsewaCallback } from '../_verify';

export async function GET(request: NextRequest) {
  return handleEsewaCallback(request, false);
}
