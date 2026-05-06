import { NextRequest, NextResponse } from 'next/server';

// TODO: Integrate with Khalti Payment API
// Docs: https://docs.khalti.com/
// Requires: KHALTI_SECRET_KEY

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({
    message: 'Khalti payment integration pending. Please use COD for now.',
    status: 'stub',
    order_id: body.order_id,
  }, { status: 501 });
}
