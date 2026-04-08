/**
 * Stockbit PDF Parser and FIFO Position Calculator
 */

export interface StockbitTransaction {
  date: string;
  stock: string;
  type: 'B' | 'S'; // B = Buy, S = Sell
  lot: number;
  price: number;
}

export interface OpenPosition {
  symbol: string;
  totalLot: number;
  averagePrice: number;
  modal: number;
  transactions: StockbitTransaction[];
}

/**
 * Main function to parse Stockbit PDF and calculate FIFO positions
 */
export async function parseStockbitPdf(file: File): Promise<OpenPosition[]> {
  const fileReader = new FileReader();
  
  return new Promise((resolve, reject) => {
    fileReader.onload = async () => {
      try {
        const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
        
        // Use direct ESM import for pdfjs-dist v5 (Next.js 16 / Turbopack compatible)
        // @ts-ignore
        const pdfjs = await import("pdfjs-dist/build/pdf.min.mjs");
        // @ts-ignore
        const pdfjsLib = pdfjs.default || pdfjs;
        
        // Explicit Worker Configuration (matching package.json version 5.6.205)
        // unpkg is more reliable for ESM module fetches than cdnjs for this package.
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // Filter items that have string content (v5 compatibility)
          // Join with plenty of spaces to ensure regex boundaries remain intact
          const pageText = textContent.items
            .filter((item: any) => typeof item.str === 'string')
            .map((item: any) => item.str)
            .join("  ");
          fullText += pageText + "\n";
        }

        const transactions = extractStockbitTransactions(fullText);
        
        if (transactions.length === 0) {
          throw new Error("Tidak menemukan data transaksi di PDF ini. Pastikan file benar.");
        }

        const openPositions = calculateFIFOPositions(transactions);
        resolve(openPositions);
      } catch (e: any) {
        console.error("PDF Parser Error:", e);
        reject(new Error(e.message || "Gagal memproses PDF"));
      }
    };
    
    fileReader.onerror = () => reject(new Error("Gagal membaca file dari disk"));
    fileReader.readAsArrayBuffer(file);
  });
}

/**
 * Extract transactions from the processed text
 */
function extractStockbitTransactions(text: string): StockbitTransaction[] {
  const transactions: StockbitTransaction[] = [];
  
  // Refined pattern with GLOBAL flag /g to capture ALL matches per page/string
  // Date | Due Date | Symbol | B/S | Lot | Price
  const rowPattern = /(\d{2}\/\d{2}\/\d{4})\s+\d{2}\/\d{2}\/\d{4}\s+([A-Z0-9]{3,8})\s+([BS])\s+([\d,.]+)\s+([\d,.]+)/gi;

  // Use matchAll to find every transaction in the document
  const matches = Array.from(text.matchAll(rowPattern));
  
  matches.forEach(match => {
    const [_, date, stock, type, lotStr, priceStr] = match;
    transactions.push({
      date,
      stock: stock.toUpperCase(),
      type: type.toUpperCase() as 'B' | 'S',
      lot: parseInt(lotStr.replace(/[,.]/g, '')),
      price: parseFloat(priceStr.replace(/[,.]/g, ''))
    });
  });

  // Sort by date ascending to ensure FIFO works correctly
  return transactions.sort((a, b) => {
    const [da, ma, ya] = a.date.split('/').map(Number);
    const [db, mb, yb] = b.date.split('/').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });
}

/**
 * Calculate Open Positions using FIFO logic
 */
function calculateFIFOPositions(transactions: StockbitTransaction[]): OpenPosition[] {
  const positions: Record<string, StockbitTransaction[]> = {}; // sym: queue of buys

  transactions.forEach(tx => {
    if (!positions[tx.stock]) {
      positions[tx.stock] = [];
    }

    if (tx.type === 'B') {
      // Add buy to queue (FIFO)
      positions[tx.stock].push({ ...tx });
    } else {
      // Sell: Process oldest buys first
      let lotToSell = tx.lot;
      while (lotToSell > 0 && positions[tx.stock].length > 0) {
        const oldestBuy = positions[tx.stock][0];
        if (oldestBuy.lot <= lotToSell) {
          lotToSell -= oldestBuy.lot;
          positions[tx.stock].shift(); // Fully sold that batch
        } else {
          oldestBuy.lot -= lotToSell; // Partially sold that batch
          lotToSell = 0;
        }
      }
    }
  });

  // Convert queues back to OpenPosition objects
  return Object.entries(positions)
    .map(([symbol, remainingBuys]) => {
      if (remainingBuys.length === 0) return null;

      const totalLot = remainingBuys.reduce((acc, buy) => acc + buy.lot, 0);
      const modalValue = remainingBuys.reduce((acc, buy) => acc + (buy.lot * 100 * buy.price), 0);
      const averagePrice = totalLot > 0 ? (modalValue / (totalLot * 100)) : 0;

      return {
        symbol,
        totalLot,
        averagePrice: Math.round(averagePrice * 100) / 100, // round to 2 decimals
        modal: modalValue,
        transactions: remainingBuys
      };
    })
    .filter((pos): pos is OpenPosition => pos !== null && pos.totalLot > 0);
}
