import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action, category, question, answer, submitted_by } = await req.json();

  if (action === "approve") {
    const { error: insertError } = await supabase
      .from("faqs")
      .insert([{ 
        category, 
        question, 
        answer, 
        submitted_by,
        submitted_at: new Date().toISOString()
      }]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  const { error: deleteError } = await supabase
    .from("pending_faqs")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}