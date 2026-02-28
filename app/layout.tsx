import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

// Metadata – optimized for Klimarx Gym (SEO, social sharing, icons)
export const metadata: Metadata = {
  title: {
    default: 'Klimarx Gym – Your Fitness Journey Starts Here',
    template: '%s | Klimarx Gym',
  },
  description:
    'Join Klimarx Gym in Lagos – modern fitness center with expert trainers, flexible memberships, group classes, and a motivating community. Start your transformation today.',
  keywords: [
    'Klimarx Gym',
    'gym Lagos',
    'fitness center Lagos',
    'gym membership Nigeria',
    'personal training Lagos',
    'group fitness classes',
    'weight loss gym',
    'muscle building Lagos',
  ],
  authors: [{ name: 'Klimarx Gym', url: 'https://klimarx.com' }],
  creator: 'Klimarx Gym',
  publisher: 'Klimarx Space Enterprises',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Klimarx Gym – Power Your Fitness Goals',
    description:
      'Premium gym in Lagos with state-of-the-art equipment, certified trainers, and flexible plans. Join the community today.',
    url: 'https://klimarx.com',
    siteName: 'Klimarx Gym',
    images: [
      {
        url: '/og-image.jpg', // ← add this image to public/
        width: 1200,
        height: 630,
        alt: 'Klimarx Gym Interior',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Klimarx Gym – Lagos Fitness Community',
    description:
      'Modern gym in Lagos. Memberships, classes, personal training. Start today.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Optional: Add any custom meta tags, Google Analytics, etc. */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}