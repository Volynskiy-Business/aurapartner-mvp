import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AuraPartnerAI - Vector-Native AI Assistant',
  description: 'Contextual intelligence with 99.2% memory accuracy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-bold text-gray-900">
                AuraPartnerAI
              </h1>
              <span className="text-sm text-gray-500">
                Vector-Native Intelligence
              </span>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
