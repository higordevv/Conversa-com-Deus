import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Numero de telefone obrigatorio" }, { status: 400 })
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "")
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("whatsapp_number", formattedPhone)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({
      exists: !!profile,
      profile: profile || null,
    })
  } catch (error: any) {
    console.error("Erro ao checkar telefone", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
