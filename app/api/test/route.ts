export async function GET() {
  try {
    const FOLDER_ID = "1adJ7JRP9C-TYcASwqVsMlMQOudvcpvAr";
    const API_KEY = process.env.GOOGLE_API_KEY;
    
    // Test fetching content of first doc
    const fileId = "1eZOWn-GXf3zluBuRbO8Di-AKotu1P2gXSwBqfh1mMAM";
    const url = `https://docs.googleapis.com/v1/documents/${fileId}?key=${API_KEY}`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    return Response.json({ 
      status: res.status,
      hasContent: !!data.body,
      preview: JSON.stringify(data).slice(0, 500)
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}