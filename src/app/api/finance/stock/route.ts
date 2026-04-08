import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ success: false, error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // Note: In high-performance production, you'd use a dedicated financial provider API.
    // This is a robust mock for local development and demonstration.
    const mockPrices: Record<string, number> = {
      'BBCA.JK': 10250,
      'BBRI.JK': 5450,
      'TLKM.JK': 3820,
      'ASII.JK': 5125,
      'GOTO.JK': 68,
      'ANTM.JK': 1645
    };

    const currentPrice = mockPrices[symbol] || (Math.random() * 5000 + 100);
    
    return NextResponse.json({ 
      success: true, 
      symbol, 
      currentPrice,
      currency: 'IDR',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
