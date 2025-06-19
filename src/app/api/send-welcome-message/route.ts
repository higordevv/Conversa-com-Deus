import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@lib/supabase"

const welcomeVerses = [
  {
    text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.",
    reference: "Jeremias 29:11",
  },
  {
    text: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13",
  },
  {
    text: "O Senhor é o meu pastor; nada me faltará.",
    reference: "Salmos 23:1",
  },
  {
    text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.",
    reference: "Salmos 37:5",
  },
  {
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.",
    reference: "Romanos 8:28",
  },
  {
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
    reference: "Isaías 41:10",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { userId, whatsappNumber, userName } = await request.json()

    if (!userId || !whatsappNumber) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    }

    const supabase = createServerClient()

    const randomVerse = welcomeVerses[Math.floor(Math.random() * welcomeVerses.length)]

    const welcomeMessage = generateWelcomeMessage(userName || "amigo(a)", randomVerse)

    const messageResult = await sendWhatsAppMessage(whatsappNumber, welcomeMessage)

    const messageData = {
      user_id: userId,
      message_type: "welcome",
      message_content: welcomeMessage,
      delivery_status: messageResult.success ? "sent" : "failed",
      sent_at: new Date().toISOString(),
    }

    await supabase.from("daily_messages").insert(messageData)


    return NextResponse.json({
      success: messageResult.success,
      message: messageResult.success ? "Mensagem de boas-vindas enviada com sucesso" : "Falha ao enviar mensagem de boas-vindas",
      messageId: messageResult.messageId,
    })
  } catch (error: any) {
    console.error("Erro ao enviar mensagem de boas-vindas:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateWelcomeMessage(userName: string, verse: { text: string; reference: string }): string {
  return `🙏 *Bem-vindo(a) à Conversa com Deus!*

Olá ${userName}! 

Que alegria ter você conosco! A partir de agora, você receberá mensagens diárias de inspiração e crescimento espiritual.

📖 *Versículo de Boas-Vindas:*
"${verse.text}" - ${verse.reference}

✨ *Você agora faz parte da Conversa com Deus!*

Todos os dias você receberá:
• Versículos bíblicos inspiradores
• Orações especiais
• Reflexões para seu crescimento espiritual

🌅 Sua primeira mensagem diária chegará amanhã pela manhã!

Que Deus abençoe sua jornada conosco! 🙏❤️

_Para upgrade e conteúdo completo, acesse seu painel no site._`
}

// Function to integrate with Z-API
async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`
    const zapiInstanceId = process.env.ZAPI_INSTANCE_ID
    const zapiToken = process.env.ZAPI_TOKEN
    const zapiClientToken = process.env.ZAPI_CLIENT_TOKEN
    if (!zapiInstanceId || !zapiToken) {
      console.log("Credenciais Z-API não configuradas, simulando envio de mensagem")
      console.log(`Enviaria para ${formattedPhone}:`, message)
      return { success: true, messageId: `sim_${Date.now()}` }
    }

    const response = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "client-token": zapiClientToken as string

      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
      }),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      return { success: true, messageId: result.messageId }
    } else {
      return { success: false }
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem do WhatsApp:", error)
    return { success: false }
  }
}
