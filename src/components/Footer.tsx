import { Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-600 p-3">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2">Conversa com Deus</h3>
          <p className="text-gray-400 mb-8">Fortalecendo sua fé, um dia de cada vez</p>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">© 2025 Conversa com Deus. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
