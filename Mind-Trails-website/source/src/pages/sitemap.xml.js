const PAGES = ['/'];
const LASTMOD = '2026-08-12';

export function GET({ site }) {
  const base = site?.href?.replace(/\/$/, '') ?? '';
  const urls = PAGES.map((p) => ({ loc: base + p, pri: '1.0' }));

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><lastmod>${LASTMOD}</lastmod>` +
          `<changefreq>monthly</changefreq><priority>${u.pri}</priority></url>`
      )
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
