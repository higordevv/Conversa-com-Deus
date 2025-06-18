# 🙏 Conversa com Deus

**Conversa com Deus** é um MVP de aplicação espiritual que envia mensagens diárias no WhatsApp com versículos bíblicos, orações e devocionais.\
Ideal para quem busca fortalecer sua fé com mensagens edificantes, de forma simples e automatizada.



---

## ✨ Funcionalidades

- 📖 Envio diário de versículos, orações e devocionais no WhatsApp
- 👤 Cadastro e login de usuários com e-mail e número do WhatsApp (via Supabase)
- 💼 Página de perfil com dados do usuário e status do plano (gratuito ou premium)
- 💳 Integração com Stripe para cobrança de assinatura mensal (R\$12,90)
- ⚙️ Automação completa com Make.com e Z-API para envio automático de mensagens

---

## 💦 Tecnologias Utilizadas

- [Next.js](https://nextjs.org/) – Framework React para frontend e backend
- [Supabase](https://supabase.com/) – Autenticação e banco de dados
- [Stripe](https://stripe.com/) – Processamento de pagamentos
- [Make.com](https://www.make.com/) – Automação de fluxos
- [Z-API](https://z-api.io/) – Envio de mensagens via WhatsApp
- [Tailwind CSS](https://tailwindcss.com/) – Estilização rápida e moderna

---

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/higordevv/conversa-com-deus.git
cd conversa-com-deus
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env.local` na raiz do projeto com as variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PREMIUM_PRICE_ID=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Rode o projeto:

```bash
npm run dev
```

---

## 🧪 Em Desenvolvimento

✅ MVP funcional\
🚧 Webhook do Stripe para atualizar o plano automaticamente\
🚧 Melhorias na UI/UX\
🚧 Tradução para outros idiomas

---

## 🤝 Contribuindo

Contribuições são bem-vindas!\
Abra uma issue ou envie um pull request com ideias, melhorias ou correções.

---

## 📜 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
