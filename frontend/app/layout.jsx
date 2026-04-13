import { Inter, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
    display: 'swap',
});
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: '--font-space-grotesk',
    display: 'swap',
});
export const metadata = {
    title: 'SafeRoute | Modern Transport Management System',
    description: 'Real-time GPS tracking, QR-based boarding, dynamic fare calculation, and comprehensive transport safety management for guardians, travelers, and partners.',
    keywords: ['transport management', 'GPS tracking', 'safety', 'QR boarding', 'fare calculation', 'SOS alerts'],
    authors: [{ name: 'SafeRoute Team' }],
    generator: 'v0.app',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
};
export const viewport = {
    themeColor: '#1a1a2e',
    width: 'device-width',
    initialScale: 1,
};
export default function RootLayout({ children, }) {
    return (<html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased overflow-x-hidden`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>);
}
