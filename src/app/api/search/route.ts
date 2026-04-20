import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  try {
    // DuckDuckGo Instant Answer API (no key required)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();

    const results: { title: string; snippet: string; url: string }[] = [];

    // Abstract (top answer)
    if (data.AbstractText) {
      results.push({ title: data.Heading || query, snippet: data.AbstractText, url: data.AbstractURL || '' });
    }

    // Related topics
    for (const topic of (data.RelatedTopics || []).slice(0, 5)) {
      if (topic.Text && topic.FirstURL) {
        results.push({ title: topic.Text.split(' - ')[0] || '', snippet: topic.Text, url: topic.FirstURL });
      }
    }

    // Answer (e.g. calculations, unit conversions)
    if (data.Answer) {
      results.unshift({ title: 'Answer', snippet: data.Answer, url: '' });
    }

    return NextResponse.json({ results, query });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
