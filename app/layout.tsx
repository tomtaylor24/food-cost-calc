import { Noto_Sans_JP } from "next/font/google"
import "./globals.scss"
import { Toaster } from "react-hot-toast"
import { ReactNode } from "react"
import type { Metadata } from "next"

type Props = {
  children: ReactNode
}

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-ja",
})

export const metadata: Metadata = {
  title: "原価管理ツール",
  description: "商品ごとの原価と原価率を計算・管理するツール",
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body>
        {children}
        <Toaster position="top-center"/>
      </body>
    </html>
  )
}

export default RootLayout
