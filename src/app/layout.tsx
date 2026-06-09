import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/midnight-theme.css'
import './globals.css'
import AIChatToggle from '@/components/chat/ai-chat-toggle'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'ClaimDefender - AI Insurance Claims Advocate',
  description: 'Autonomous AI-powered insurance claims advocacy to fight denials and maximize your settlements. Secure, professional, and effective.',
  keywords: 'insurance claims, AI advocate, claim appeal, insurance denial, claim defender',
  authors: [{ name: 'ClaimDefender' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0B0F19',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} midnight-gradient min-h-screen antialiased font-sans`}>
        <div className="min-h-screen bg-midnight-bg">
          {children}
        </div>
        {/* AI Chat Assistant */}
        <AIChatToggle />
      </body>
    </html>
  )
}
