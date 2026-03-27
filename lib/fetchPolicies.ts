import fs from "fs";
import path from "path";

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

      const filePath = path.join(policiesDir, filename);
      const content = fs.readFileSync(filePath, "utf-8");
      const title = filename.replace(/\.(pdf|docx|doc|txt|md)$/i, "");

      policies.push({
        title,
        content: content.slice(0, 3000),
        url: `/policies/${filename}`,
      });
    }

    return policies;
  } catch (error) {
    console.error("Error reading policies from disk:", error);
    return [];
  }
}
