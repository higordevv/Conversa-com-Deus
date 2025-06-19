"use client"

import { useEffect, useState } from "react"
import { supabase } from "@lib/supabase"
import {  Button,Card, CardContent, CardDescription, CardHeader, CardTitle, Badge  } from "@components/ui/"
import { Heart, User, Phone, CreditCard, LogOut, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Profile {
  id: string
  email: string
  whatsapp_number: string
  plan_type: "free" | "premium"
  subscription_status: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        router.push("/login")
        return
      }

      if (!session?.user) {
        console.log("No active session found")
        router.push("/login")
        return
      }

      const user = session.user

      const { data, error, status } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })

        if (error.code === "42P01" || error.message?.includes("relation") || error.message?.includes("table")) {
          alert("Database não configurado. Execute o script SQL primeiro.")
          return
        }

        console.warn("Database error, but continuing...")
      }

      if (!data) {
        console.log("Creating new profile for user:", user.id)

        const newProfileData = {
          id: user.id,
          email: user.email || "",
          whatsapp_number: user.user_metadata?.whatsapp_number || "",
          plan_type: "free" as const,
          subscription_status: "inactive",
        }

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert(newProfileData)
          .select()
          .single()

        if (createError) {
          console.error("Error creating profile:", createError)

          console.log("Using temporary profile data")
          setProfile({
            id: user.id,
            email: user.email || "",
            whatsapp_number: user.user_metadata?.whatsapp_number || "",
            plan_type: "free",
            subscription_status: "inactive",
          })
          return
        }

        setProfile(newProfile)
      } else {
        setProfile(data)
      }
    } catch (error: any) {
      console.error("Unexpected error in getProfile:", error)

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          console.log("Using fallback profile data")
          setProfile({
            id: user.id,
            email: user.email || "",
            whatsapp_number: user.user_metadata?.whatsapp_number || "",
            plan_type: "free",
            subscription_status: "inactive",
          })
          return
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
      }

      alert("Erro ao carregar dados. Tente fazer login novamente.")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleUpgrade = async () => {
    if (!profile) return

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          email: profile.email,
        }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error creating checkout session:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Configuração Necessária</CardTitle>
            <CardDescription>Parece que o sistema ainda não foi configurado completamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/setup">Ir para Configuração</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conversa com Deus</h1>
              <p className="text-gray-600">Seu painel pessoal</p>
            </div>
          </div>

          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>Seus dados pessoais e informações da conta</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{profile.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.whatsapp_number}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plano Atual
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                {profile.plan_type === "premium" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      <Badge variant="default" className="bg-yellow-500">
                        Premium
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Você tem acesso completo a todos os recursos</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="secondary">Gratuito</Badge>
                    <p className="text-sm text-gray-600">Conteúdo limitado diário</p>
                  </div>
                )}
              </div>

              {profile.plan_type === "free" && (
                <Button onClick={handleUpgrade} className="w-full">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade para Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Daily Content Preview */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Prévia do Conteúdo Diário</CardTitle>
              <CardDescription>Exemplo do que você recebe no WhatsApp</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-800 mb-2">🌅 Conversa com Deus</p>

                    {profile.plan_type === "premium" ? (
                      <div className="space-y-3 text-sm text-green-700">
                        <div>
                          <p className="font-medium">📖 Versículo do Dia:</p>
                          <p className="italic">
                            "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de
                            paz e não de mal, para vos dar o fim que esperais." - Jeremias 29:11
                          </p>
                        </div>

                        <div>
                          <p className="font-medium">🙏 Oração:</p>
                          <p>
                            Senhor, obrigado por seus planos perfeitos para minha vida. Ajude-me a confiar em Ti em
                            todos os momentos...
                          </p>
                        </div>

                        <div>
                          <p className="font-medium">💭 Reflexão:</p>
                          <p>
                            Deus tem planos específicos para cada um de nós. Mesmo quando não entendemos o caminho,
                            podemos descansar na certeza de que Ele nos ama e quer o melhor...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-green-700">
                        <div>
                          <p className="font-medium">📖 Versículo do Dia:</p>
                          <p className="italic">
                            "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor" - Jeremias 29:11
                          </p>
                        </div>

                        <div>
                          <p className="font-medium">🙏 Oração Simples:</p>
                          <p>Senhor, obrigado por cuidar de mim. Amém.</p>
                        </div>

                        <p className="text-xs text-green-600 mt-3">
                          ⭐ Upgrade para Premium e receba conteúdo completo!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
