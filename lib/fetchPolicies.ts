const FOLDER_ID = "1adJ7JRP9C-TYcASwqVsMlMQOudvcpvAr";
const API_KEY = process.env.GOOGLE_API_KEY;

export interface Policy {
  title: string;
  content: string;
  url: string;
}

async function listFiles() {
  const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to list files: ${res.statusText}`);
  const data = await res.json();
  return data.files as { id: string; name: string; mimeType: string }[];
}

async function fetchGoogleDocText(fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return "";
  return await res.text();
}

async function fetchExportedText(fileId: string, mimeType: string): Promise<string> {
  const exportMime = "text/plain";
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${exportMime}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const dlUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
    const dlRes = await fetch(dlUrl);
    if (!dlRes.ok) return "";
    return await dlRes.text();
  }
  return await res.text();
}

export async function fetchPoliciesFromDrive(): Promise<Policy[]> {
  try {
    const files = await listFiles();
    const policies: Policy[] = [];

    for (const file of files) {
      let content = "";

      if (file.mimeType === "application/vnd.google-apps.document") {
        content = await fetchGoogleDocText(file.id);
      } else if (
        file.mimeType === "application/pdf" ||
        file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.mimeType === "application/msword"
      ) {
        content = await fetchExportedText(file.id, file.mimeType);
      }

      if (content) {
        policies.push({
          title: file.name.replace(/\.(pdf|docx|doc)$/i, ""),
          content: content.slice(0, 3000),
          url: `https://drive.google.com/file/d/${file.id}/view`,
        });
      }
    }

    return policies;
  } catch (error) {
    console.error("Error fetching policies from Drive:", JSON.stringify(error, null, 2));
    return [];
  }
}