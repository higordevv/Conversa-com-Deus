"use client";

import type React from "react";

import { useState } from "react";
import { supabase } from "@lib/supabase";
import {
  Button,
  Label,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ToastContainer,
  toast,
  Slide,
} from "@components/ui/";

import {
  Heart,
  ArrowLeft,
  MessageCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "phone-check" | "login" | "signup";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("phone-check");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [existingUser, setExistingUser] = useState<any>(null);
  const router = useRouter();

  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  };

  const handlePhoneCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: whatsappNumber }),
      });

      const result = await response.json();

      if (result.exists) {
        setExistingUser(result.profile);
        setMode("login");
      } else {
        setMode("signup");
      }
    } catch (error: any) {
      alert(error.message || "Erro ao verificar número");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!existingUser) return;
    setLoading(true);
    try {
      localStorage.setItem(
        "devotional_user",
        JSON.stringify({
          id: existingUser.id,
          email: existingUser.email,
          whatsapp_number: existingUser.whatsapp_number,
          plan_type: existingUser.plan_type,
          is_admin: existingUser.is_admin,
        })
      );

      router.push("/dashboard");
    } catch (error: any) {
      toast(error.message || "Erro ao fazer login", {
        position: "bottom-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        theme: "dark",
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(whatsappNumber);

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          email,
          whatsapp_number: formattedPhone,
          plan_type: "free",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este email já está cadastrado");
        }
        throw error;
      }

      try {
        await fetch("/api/send-welcome-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.id,
            whatsappNumber: formattedPhone,
            email: email,
          }),
        });
      } catch (welcomeError) {
        console.error("Welcome message failed:", welcomeError);
      }

      localStorage.setItem(
        "devotional_user",
        JSON.stringify({
          id: data.id,
          email: data.email,
          whatsapp_number: data.whatsapp_number,
          plan_type: data.plan_type,
          is_admin: data.is_admin,
        })
      );

      router.push("/dashboard");
    } catch (error: any) {
      toast(error.message || "Erro ao criar conta", {
        position: "bottom-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        theme: "dark",
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setMode("phone-check");
    setWhatsappNumber("");
    setEmail("");
    setExistingUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>

          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Conversa com Deus
          </h1>
          <p className="text-gray-600">
            {mode === "phone-check" && "Entre com seu WhatsApp"}
            {mode === "login" && "Bem-vindo de volta!"}
            {mode === "signup" && "Comece sua jornada espiritual"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "phone-check" && "Entrar ou Criar Conta"}
              {mode === "login" && "Login"}
              {mode === "signup" && "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {mode === "phone-check" && "Digite seu WhatsApp para continuar"}
              {mode === "login" &&
                `Olá! Encontramos sua conta: ${existingUser?.email}`}
              {mode === "signup" &&
                "Agora precisamos do seu email para criar sua conta"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "phone-check" && (
              <form onSubmit={handlePhoneCheck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Verificaremos se você já tem uma conta
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </form>
            )}

            {mode === "login" && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Conta encontrada!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    WhatsApp: {whatsappNumber}
                  </p>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar na Minha Conta"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={resetFlow}
                  className="w-full"
                >
                  Usar outro número
                </Button>
              </div>
            )}

            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-display">WhatsApp</Label>
                  <Input
                    id="whatsapp-display"
                    type="tel"
                    value={whatsappNumber}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={resetFlow}
                  className="w-full"
                >
                  Voltar
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
}
