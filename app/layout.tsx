import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './components/AuthProvider'

export const metadata: Metadata = {
  title: 'MeetScheduler - Google Meet Integration',
  description: 'Schedule Google Meet calls effortlessly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #666',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
