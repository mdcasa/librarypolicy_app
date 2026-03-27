import { fetchPoliciesFromDrive } from "@/lib/fetchPolicies";

export async function GET() {
  try {
    const policies = await fetchPoliciesFromDrive();
    return Response.json({ 
      count: policies.length,
      titles: policies.map(p => p.title),
      firstContent: policies[0]?.content?.slice(0, 200)
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}