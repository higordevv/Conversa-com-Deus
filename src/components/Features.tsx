import { Shield, Smartphone, Clock, Star } from "lucide-react"

const features = [
  {
    icon: Smartphone,
    title: "WhatsApp Integrado",
    description: "Receba suas mensagens diretamente no WhatsApp, sem precisar de apps extras.",
  },
  {
    icon: Clock,
    title: "Mensagens Diárias",
    description: "Conteúdo inspirador todos os dias no horário que você preferir.",
  },
  {
    icon: Star,
    title: "Conteúdo Premium",
    description: "Devocionais completos, estudos bíblicos e orações especiais.",
  },
  {
    icon: Shield,
    title: "Seguro e Confiável",
    description: "Seus dados protegidos e mensagens entregues com segurança.",
  },
]

export default function Features() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher a Palavra Diária?</h2>
          <p className="text-xl text-gray-600">Uma forma simples e eficaz de fortalecer sua fé todos os dias</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
