/**
 * Yahoo Finance Proxy API
 * Fetches real-time stock price and historical data from Yahoo Finance
 */

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const interval = searchParams.get("interval") || "1d";
  const range = searchParams.get("range") || "1mo";

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    // Yahoo Finance V8 Chart API
    // interval: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
    // range: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ price: null, status: "N/A" });
      }
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return NextResponse.json({ price: null, status: "N/A" });
    }

    const price = result.meta?.regularMarketPrice;
    const currency = result.meta?.currency;
    const exchangeName = result.meta?.exchangeName;
    const previousClose = result.meta?.previousClose;
    
    // Extract chart data
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0]?.close || [];
    
    const chartData = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString(),
      price: quotes[index] || null
    })).filter((d: any) => d.price !== null);

    return NextResponse.json({
      symbol,
      price,
      currency,
      exchange: exchangeName,
      previousClose,
      status: "Live",
      chartData,
      lastFetched: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Yahoo Finance Proxy Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat harga", details: error.message },
      { status: 500 }
    );
  }
}
