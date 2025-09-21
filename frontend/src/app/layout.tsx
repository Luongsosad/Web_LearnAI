import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/app/layouts/Sidebar';
import { AuthProvider } from '@/contexts/auth.context';
import { getUser } from '@/lib/services/user.service';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://learning-by-ai.vercel.app'),
  title: {
    default: 'Learning By AI',
    template: '%s | Learning By AI',
  },
  description:
    'Learning By AI - Ứng dụng học tiếng Anh thông minh: Trò chuyện với AI, luyện giao tiếp, luyện nghe, kiểm tra phát âm, thẻ ghi nhớ, đọc truyện song ngữ, bài tập luyện tập.',
  keywords: [
    'Learning By AI',
    'Learning By AI - Ứng dụng học tiếng Anh thông minh',
    'Learning AI',
    'Learn AI',
    'Learn English',
    'learning by ai',
    'learn ai',
    'learning ai',
    'learn english by ai',
    'learn english with ai',
    'learning with ai',
    'học tiếng Anh bằng AI',
    'ứng dụng học tiếng Anh',
    'luyện giao tiếp với AI',
    'luyện nghe tiếng Anh',
    'kiểm tra phát âm',
    'flashcards từ vựng',
    'truyện song ngữ',
    'bài tập điền khuyết',
    'học ngôn ngữ với AI',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://learning-by-ai.vercel.app/',
    siteName: 'Learning By AI',
    title: 'Learning By AI',
    description:
      'Học tiếng Anh hiệu quả với AI: trò chuyện, giao tiếp, nghe, phát âm, flashcards, truyện song ngữ và bài tập.',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learning By AI',
    description:
      'Học tiếng Anh hiệu quả với AI: trò chuyện, giao tiếp, nghe, phát âm, flashcards, truyện song ngữ và bài tập.',
    creator: '@learning-by-ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE,
  },
  authors: [{ name: 'Learning By AI' }],
  creator: 'Learning By AI',
  publisher: 'Learning By AI',
  applicationName: 'Learning By AI',
  category: 'education',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
  colorScheme: 'light dark',
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}>
        <AuthProvider user={user}>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
