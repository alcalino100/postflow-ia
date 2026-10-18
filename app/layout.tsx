import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const plusJakarta = Plus_Jakarta_Sans({ variable: '--font-plus-jakarta', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PostFlow IA — Agendador de posts e Reels',
  description: 'Painel para agendar posts e Reels no Facebook e Instagram com legendas geradas por IA',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${plusJakarta.variable} bg-background`}
    >
      <body className="font-sans antialiased tabular-nums">
        {children}
        <Toaster position="bottom-right" richColors duration={4000} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
