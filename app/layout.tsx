import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'

// Metadata – optimized for Insight Gym SaaS
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Insight Gym – Automate Your Fitness Business',
    template: '%s | Insight Gym',
  },
  description:
    'Insight Gym is the ultimate management platform for modern fitness centers. Member tracking, automated billing, and powerful analytics.',
  keywords: [
    'gym management software',
    'fitness SaaS',
    'gym automation',
    'member tracking',
    'gym analytics',
    'fitness business',
  ],
  authors: [{ name: 'Insight Gym Team', url: 'https://insightgym.com' }],
  creator: 'Insight Gym',
  publisher: 'Insight Automated Gym Enterprises',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Insight Gym – Power Your Fitness Business',
    description:
      'Premium infrastructure for gym owners. State-of-the-art management tools, analytics, and member engagement.',
    url: 'https://insightgym.com',
    siteName: 'Insight Gym',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Insight Gym Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insight Gym – The Future of Gym Management',
    description:
      'Modern SaaS for fitness centers. Memberships, classes, personal training, and more.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <head>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
