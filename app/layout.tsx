import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'アレマル - アレルギーっ子家族のための安心情報共有サービス',
  description: 'アレルギーを持つお子さんとご家族が安心して外食や買い物ができるよう、情報を共有するサービスです。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}