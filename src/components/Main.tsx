import Link from "next/link"
import { Button } from "@components/ui/"
import { Heart, MessageCircle, Calendar } from "lucide-react"

export default function Main() {
  return (
    <section className="relative px-4 py-20 text-center">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-blue-100 p-4">
            <Heart className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Conversa com Deus</h1>

        <p className="mb-8 text-xl text-gray-600 sm:text-2xl">
          Receba versículos bíblicos, orações e devocionais inspiradores diretamente no seu WhatsApp todos os dias
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            <span>WhatsApp Diário</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Conteúdo Personalizado</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>Crescimento Espiritual</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/login">Começar Gratuitamente</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#pricing">Ver Planos</Link>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <strong>Bônus:</strong> Receba uma mensagem de boas-vindas com versículo especial ao se cadastrar!
          </p>
        </div>
      </div>
    </section>
  )
}
