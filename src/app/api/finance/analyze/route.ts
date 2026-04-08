import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { assetData } = await request.json();
    
    const prompt = `Lakukan analisis singkat (maks 3 kalimat) untuk aset berikut:
    Nama: ${assetData.name}
    Simbol: ${assetData.symbol}
    P/L: ${assetData.pnl}%
    Saran tindakan: Apakah Hold, Buy More, atau Sell berdasarkan performa?`;

    // This is a mock AI response for now, but configured for future integration
    // In a real app, you'd call Gemini/OpenAI here.
    const mockAnalysis = `Performa ${assetData.name} (${assetData.symbol}) menunjukkan ${parseFloat(assetData.pnl) >= 0 ? "tren positif dengan kenaikan " + assetData.pnl + "%" : "penurunan " + Math.abs(parseFloat(assetData.pnl)) + "%"}. Mengingat fundamental sektor ini, disarankan untuk tetap Hold sambil memantau resistensi harga. Diversifikasi lebih lanjut dapat memitigasi risiko volatilitas saat ini.`;

    return NextResponse.json({ success: true, content: mockAnalysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
