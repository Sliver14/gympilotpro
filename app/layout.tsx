import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieConsent } from '@/components/cookie-consent'
import TawkToChat from '@/components/tawk-to-chat'

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
    default: 'GymPilotPro | Stop Revenue Loss. Run Your Gym Like A Pro',
    template: '%s | GymPilotPro',
  },

  description:
    'Stop losing money from expired gym members. GymPilotPro automates member tracking, WhatsApp reminders, QR check-ins, and billing—so you can run your gym like a pro.',

  keywords: [
    'gym revenue management',
    'gym automation software',
    'fitness business software',
    'gym member tracking system',
    'QR gym check-in system',
    'gym payment automation',
    'whatsapp reminders for gyms',
    'GymPilotPro',
  ],

  authors: [{ name: 'GymPilotPro Team', url: 'https://gympilotpro.com' }],
  creator: 'GymPilotPro',
  publisher: 'GymPilotPro Systems',

  openGraph: {
    title: 'Stop Revenue Loss. Run Your Gym Like A Pro',
    description:
      'Recover lost revenue from expired memberships with automated tracking, reminders, and access control.',
    url: 'https://gympilotpro.com',
    siteName: 'GymPilotPro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GymPilotPro Dashboard',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Stop Revenue Loss. Run Your Gym Like A Pro',
    description:
      'Automate your gym operations, recover missed payments, and scale like a pro.',
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
          <CookieConsent />
          <TawkToChat />
        </ThemeProvider>
      </body>
    </html>
  )
}
