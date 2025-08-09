import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://learning-by-ai.vercel.app';
  const routes = [
    '',
    '/login',
    '/register',
    '/plans',
    '/chat',
    '/conversation',
    '/listen-practice',
    '/flashcards',
    '/bilingual-story',
    '/quiz',
    '/account',
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
