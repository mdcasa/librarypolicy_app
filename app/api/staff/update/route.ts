import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-staff-password");
  if (password !== process.env.STAFF_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, category, question, answer } = await req.json();

  const { error } = await supabase
    .from("pending_faqs")
    .update({ category, question, answer })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
