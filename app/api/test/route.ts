export async function GET() {
  try {
    const FOLDER_ID = "1adJ7JRP9C-TYcASwqVsMlMQOudvcpvAr";
    const API_KEY = process.env.GOOGLE_API_KEY;
    
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    return Response.json({ 
      status: res.status,
      apiKeyExists: !!API_KEY,
      apiKeyLength: API_KEY?.length,
      data 
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}