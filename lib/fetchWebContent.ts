import * as cheerio from "cheerio";

export interface PageContent {
  title: string;
  content: string;
  url: string;
}

const PAGES_TO_FETCH = [
  { title: "Hours & Locations", url: "https://www.yclibrary.org/hours-locations" },
  { title: "Services", url: "https://www.yclibrary.org/services" },
  { title: "Library Cards", url: "https://www.yclibrary.org/library-cards" },
  { title: "FAQ", url: "https://www.yclibrary.org/faq" },
  { title: "Meeting Rooms", url: "https://www.yclibrary.org/meeting-rooms" },
  { title: "Interlibrary Loan", url: "https://www.yclibrary.org/interlibrary-loan" },
  { title: "Computer & Internet Use", url: "https://www.yclibrary.org/computer-use-policy" },
  { title: "Policies", url: "https://www.yclibrary.org/policies" },
  { title: "Kids Services", url: "https://www.yclibrary.org/kids" },
  { title: "Teen Services", url: "https://www.yclibrary.org/teens" },
  { title: "Virtual Library", url: "https://www.yclibrary.org/virtual-library" },
  { title: "Downloads & Streaming", url: "https://www.yclibrary.org/downloads-streaming" },
  { title: "Events", url: "https://www.yclibrary.org/events" },
  { title: "Mobile App", url: "https://www.yclibrary.org/mobile-app" },
  { title: "Circulation Policy", url: "https://www.yclibrary.org/circulation-policy" },
  { title: "Fines & Fees", url: "https://www.yclibrary.org/fines-fees-policy" },
];

async function fetchPage(title: string, url: string): Promise<PageContent | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; YCL-Bot/1.0)" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    $("nav, footer, script, style, header, .header, .footer, .nav").remove();

    const text = $("body").text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    if (text.length < 100) return null;

    return { title, content: text, url };
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

export async function fetchWebContent(): Promise<PageContent[]> {
  const results = await Promise.allSettled(
    PAGES_TO_FETCH.map((p) => fetchPage(p.title, p.url))
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => (r as PromiseFulfilledResult<PageContent>).value!);
}