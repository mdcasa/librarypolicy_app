import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

export interface Policy {
  title: string;
  content: string;
  url: string;
}

export async function fetchPoliciesFromDrive(): Promise<Policy[]> {
  try {
    const policiesDir = path.join(process.cwd(), "public", "policies");
    const files = fs.readdirSync(policiesDir);

    const policies: Policy[] = [];

    for (const filename of files) {
      if (filename.startsWith(".")) continue; // skip .gitkeep etc
      if (!filename.match(/\.pdf$/i)) continue; // only PDFs

      const filePath = path.join(policiesDir, filename);
      const buffer = fs.readFileSync(filePath);
      const data = await pdf(buffer);
      const title = filename.replace(/\.pdf$/i, "");

      policies.push({
        title,
        content: data.text.slice(0, 3000),
        url: `/policies/${filename}`,
      });
    }

    return policies;
  } catch (error) {
    console.error("Error reading policies from disk:", error);
    return [];
  }
}