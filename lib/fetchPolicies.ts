import fs from "fs";
import path from "path";
import PDFParser from "pdf2json";

export interface Policy {
  title: string;
  content: string;
  url: string;
}

function parsePDF(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (err: any) => reject(err));
    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      const text = pdfData.Pages.map((page: any) =>
        page.Texts.map((t: any) => decodeURIComponent(t.R[0].T)).join(" ")
      ).join("\n");
      resolve(text);
    });
    pdfParser.loadPDF(filePath);
  });
}

export async function fetchPoliciesFromDrive(): Promise<Policy[]> {
  try {
    const policiesDir = path.join(process.cwd(), "public", "policies");

    const files = fs.readdirSync(policiesDir);

    const policies: Policy[] = [];

    for (const filename of files) {
      if (filename.startsWith(".")) continue;
      if (!filename.match(/\.pdf$/i)) continue;

      const filePath = path.join(policiesDir, filename);
      const text = await parsePDF(filePath);

     
      const title = filename.replace(/\.pdf$/i, "");

      policies.push({
        title,
        content: text.slice(0, 20000),
        url: `/policies/${filename}`,
      });
    }

    return policies;
  } catch (error) {
    console.error("Error reading policies from disk:", error);
    return [];
  }
}