export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const fileId = "1eZOWn-GXf3zluBuRbO8Di-AKotu1P2gXSwBqfh1mMAM";
    
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${API_KEY}`;
    
    const res = await fetch(url);
    const text = await res.text();
    
    return Response.json({ 
      status: res.status,
      preview: text.slice(0, 500)
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}