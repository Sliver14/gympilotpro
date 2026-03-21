import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

// Metadata – optimized for GymPilotPro SaaS
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://gympilotpro.com'),
  title: {
    default: 'GymPilotPro | Run Your Gym Like A Pro',
    template: '%s | GymPilotPro',
  },
  description:
    'GymPilotPro is the ultimate management platform for modern fitness centers. Automate your gym with WhatsApp reminders, QR check-ins, member tracking, and instant billing.',
  keywords: [
    'gym management software',
    'fitness SaaS',
    'gym automation',
    'gym member tracking',
    'gym analytics',
    'fitness business software',
    'gym billing software',
    'whatsapp gym reminders',
    'GymPilotPro',
  ],
  authors: [{ name: 'GymPilotPro Team', url: 'https://gympilotpro.com' }],
  creator: 'GymPilotPro',
  publisher: 'GymPilotPro Systems',
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
    title: 'GymPilotPro | Run Your Gym Like A Pro',
    description:
      'Premium infrastructure for gym owners. Automate billing, track attendance, and eliminate revenue loss with GymPilotPro.',
    url: 'https://gympilotpro.com',
    siteName: 'GymPilotPro',
    images: [
      {
        url: '/og-image.jpg', // Ensure you eventually add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'GymPilotPro Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GymPilotPro | Run Your Gym Like A Pro',
    description:
      'Stop losing money on expired memberships. Automate your fitness business today.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${jakarta.variable} ${jetbrains.variable} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
