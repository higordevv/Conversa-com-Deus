"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/";
import { Heart, CreditCard, LogOut, Shield, X} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardUser {
  id: string;
  email: string;
  whatsapp_number: string;
  plan_type: "free" | "premium";
  is_admin: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    try {
      const userData = localStorage.getItem("devotional_user");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error loading user:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("devotional_user");
    router.push("/");
  };

  const handleUpgrade = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Erro ao processar pagamento");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Conversa com Deus
              </h1>
              <p className="text-gray-600">Seu painel pessoal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.is_admin && (
              <Button asChild variant="outline">
                <Link href="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:max-w-xl m-auto">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Seus dados pessoais e informações da conta
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">
                    {user.email}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    WhatsApp
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    {user.whatsapp_number}
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
                {user.plan_type === "premium" ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Heart className="h-6 w-6 text-yellow-500" />
                      <Badge variant="default" className="bg-yellow-500">
                        Premium
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Você tem acesso completo a todos os recursos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="secondary">Gratuito</Badge>
                    <p className="text-sm text-gray-600">
                      Conteúdo limitado diário
                    </p>
                  </div>
                )}
              </div>

              {user.plan_type === "free" && (
                <Button onClick={handleUpgrade} className="w-full" >
                  <Heart className="h-4 w-4 mr-2" />
                  Upgrade para Premium
                </Button>
              )}
              {user.plan_type === "premium" && (
                <Button onClick={handleUpgrade} className="w-full" variant="destructive">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
