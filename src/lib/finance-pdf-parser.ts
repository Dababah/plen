/**
 * Mutual Fund PDF Parser for AKSes KSEI reports
 */

import * as pdfjsLib from "pdfjs-dist";

export async function parseMutualFundPdf(file: File) {
  const fileReader = new FileReader();
  
  return new Promise((resolve, reject) => {
    fileReader.onload = async () => {
      try {
        const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\n";
        }

        const results = extractMutualFundData(fullText);
        resolve(results);
      } catch (e) {
        reject(e);
      }
    };
    
    fileReader.onerror = () => reject(new Error("Failed to read file"));
    fileReader.readAsArrayBuffer(file);
  });
}

function extractMutualFundData(text: string) {
  const lines = text.split('\n');
  const foundFunds: any[] = [];
  
  // Heuristic patterns for AKSes KSEI
  // Looking for rows that contain "Reksa Dana" or similar and have numeric NAB/Units
  // Note: This is an idealistic version, actual KSEI PDFs are messy.
  
  lines.forEach(line => {
    // Simple matching: Try to find name, unit, and NAB in one line
    // Example: "Suconcor Stable Fund ... 1,234.56 ... 1,500.00"
    const amounts = line.match(/(\d{1,3}(,\d{3})*(\.\d+)?)/g);
    
    if (amounts && amounts.length >= 2) {
       // Heuristic search for possible reksa dana keywords
       if (line.includes("Reksa Dana") || line.includes("Fund") || line.includes("Investasi")) {
          foundFunds.push({
             name: line.split(/\d/)[0].trim(), // Rough name extraction
             units: parseFloat(amounts[0].replace(/,/g, '')),
             nab: parseFloat(amounts[1].replace(/,/g, '')),
             value: parseFloat(amounts[amounts.length - 1].replace(/,/g, ''))
          });
       }
    }
  });

  return foundFunds;
}
