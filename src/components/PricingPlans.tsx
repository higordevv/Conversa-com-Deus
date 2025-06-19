import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/"
import { Check, X } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar sua jornada espiritual",
    features: ["Versículo diário", "Oração simples", "Mensagem via WhatsApp", "Suporte básico"],
    limitations: ["Conteúdo limitado", "Sem devocionais completos", "Sem estudos bíblicos"],
    buttonText: "Começar Grátis",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium",
    price: "R$ 14,90",
    period: "/mês",
    description: "Experiência completa de crescimento espiritual",
    features: [
      "Versículos com contexto",
      "Orações personalizadas",
      "Devocionais completos",
      "Estudos bíblicos semanais",
      "Reflexões inspiradoras",
      "Suporte prioritário",
      "Conteúdo exclusivo",
      "Sem limitações",
    ],
    limitations: [],
    buttonText: "Assinar Premium",
    buttonVariant: "default" as const,
    popular: true,
  },
]

export default function PricingPlans() {
  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Escolha seu plano</h2>
          <p className="text-xl text-gray-600">Comece gratuitamente ou desbloqueie todo o potencial com o Premium</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? "border-blue-500 shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <li key={limitationIndex} className="flex items-center gap-3">
                      <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span className="text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button asChild variant={plan.buttonVariant} size="lg" className="w-full">
                  <Link href="/auth">{plan.buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
