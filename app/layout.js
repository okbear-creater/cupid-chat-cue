// app/layout.js
import './globals.css'

export const metadata = {
  title: 'Chat Companion',
  description: 'Keep your conversation flowing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#fdf1f3', margin: 0, minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}