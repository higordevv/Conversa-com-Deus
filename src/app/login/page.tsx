"use client";

import type React from "react";
import { useState } from "react";
import { supabase } from "@lib/supabase";

import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@components/ui/";
import { useRouter } from "next/navigation";

import { Heart, ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            whatsapp_number: whatsappNumber,
            first_name: firstName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email,
            whatsapp_number: whatsappNumber,
            plan_type: "free",
            subscription_status: "inactive",
          },
          {
            onConflict: "id",
          }
        );

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        try {
          const welcomeResponse = await fetch("/api/send-welcome-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: data.user.id,
              whatsappNumber: whatsappNumber,
              userName: firstName,
            }),
          });

          const welcomeResult = await welcomeResponse.json();

          if (welcomeResult.success) {
            console.log("Welcome message sent successfully");
          } else {
            console.error(
              "Failed to send welcome message:",
              welcomeResult.message
            );
          }
        } catch (welcomeError) {
          console.error("Error sending welcome message:", welcomeError);
        }

        alert(
          "Conta criada com sucesso! Verifique seu email para confirmar e aguarde sua mensagem de boas-vindas no WhatsApp!"
        );
        router.push("/dashboard");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-600">Entre ou crie sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso à Plataforma</CardTitle>
            <CardDescription>
              Entre com sua conta ou crie uma nova para começar
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Nome</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="Seu primeiro nome"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

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
                      Você receberá uma mensagem de boas-vindas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Crie uma senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
