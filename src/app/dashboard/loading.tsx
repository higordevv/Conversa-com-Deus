import { Heart } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-blue-100 p-4">
            <Heart className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Carregando seu painel...</h2>
        <p className="text-gray-600">Aguarde um momento</p>
      </div>
    </div>
  )
}
