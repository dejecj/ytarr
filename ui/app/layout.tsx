import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YTarr",
  description: "YouTube Channel Manager",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background`}>
      <div className="flex min-h-screen">
        <Header />
        <Sidebar />
        <main className="flex-1 pt-16">
          {children}
        </main>
      </div>
      </body>
    </html>
  )
}

