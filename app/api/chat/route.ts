import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { fetchPoliciesFromDrive } from "@/lib/fetchPolicies";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    const policies = await fetchPoliciesFromDrive();

    if (policies.length === 0) {
      return NextResponse.json(
        { error: "Could not load policies. Please try again later." },
        { status: 500 }
      );
    }

    const SYSTEM_PROMPT = `You are a knowledgeable and friendly library assistant helping patrons understand library policies.

Your job is to:
1. Answer questions clearly and accurately using ONLY the library policies provided below.
2. Always cite the relevant policy name when answering.
3. Always include the policy URL as a reference link (format it as markdown: [Policy Name](url)).
4. If a question touches on multiple policies, address each one.
5. If a question is not covered by any policy, politely say so and suggest the patron contact the library directly.
6. Keep answers concise but complete. Use bullet points for lists of rules or conditions.
7. Be warm and helpful — patrons may be frustrated about fines or rules.

LIBRARY POLICIES:
${policies
  .map(
    (p) => `### ${p.title}
${p.content}
Reference URL: ${p.url}`
  )
  .join("\n\n")}
`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Claude API error:", JSON.stringify(error, null, 2), error?.message, error?.cause);
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    );
  }
}