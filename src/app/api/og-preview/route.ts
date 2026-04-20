import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ title: '', description: '', image: '' });
    }

    const html = await response.text();

    const getMetaTag = (property: string) => {
      const match = html.match(new RegExp(`<meta(?:\\s+[^>]*?)?(?:property|name)=["']${property}["'][^>]*?content=["']([^"']*)["'][^>]*?>`, 'i')) || 
                    html.match(new RegExp(`<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["']${property}["'][^>]*?>`, 'i'));
      return match ? match[1] : '';
    };

    const getTitleTag = () => {
      const match = html.match(/<title>([^<]*)<\/title>/i);
      return match ? match[1] : '';
    };

    const title = getMetaTag('og:title') || getTitleTag() || '';
    const description = getMetaTag('og:description') || getMetaTag('description') || '';
    const image = getMetaTag('og:image') || '';

    return NextResponse.json({ title, description, image });
  } catch (error) {
    console.error('OG Preview Error:', error);
    return NextResponse.json({ title: '', description: '', image: '' });
  }
}
