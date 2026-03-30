import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-staff-password");
  if (password !== process.env.STAFF_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { category, question, answer, submitted_by } = await req.json();

  if (!category || !question || !answer || !submitted_by) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("pending_faqs")
    .insert([{ category, question, answer, submitted_by }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: process.env.ADMIN_EMAIL!,
    subject: "New FAQ Submission Pending Review",
    html: `
      <h2>New FAQ Submission</h2>
      <p><strong>Submitted by:</strong> ${submitted_by}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Question:</strong> ${question}</p>
      <p><strong>Answer:</strong> ${answer}</p>
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin">Click here to review in Admin Panel</a></p>
    `,
  });

  return NextResponse.json({ success: true });
}