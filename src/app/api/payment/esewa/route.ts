import { NextRequest, NextResponse } from 'next/server';

// TODO: Integrate with eSewa Merchant API
// Docs: https://developer.esewa.com.np/
// Requires: ESEWA_MERCHANT_ID, ESEWA_SECRET_KEY

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({
    message: 'eSewa payment integration pending. Please use COD for now.',
    status: 'stub',
    order_id: body.order_id,
  }, { status: 501 });
}
