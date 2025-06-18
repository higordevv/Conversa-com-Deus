import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Palavra Diária - Mensagens Inspiradoras no WhatsApp",
  description:
    "Receba versículos bíblicos, orações e devocionais inspiradores diretamente no seu WhatsApp todos os dias."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
