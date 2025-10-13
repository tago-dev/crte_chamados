# Configuração de Email para Cancelamento de Chamados

## Visão Geral

O sistema de cancelamento de chamados inclui o envio automático de emails de notificação para os usuários quando um chamado é cancelado por um administrador.

## Implementação Atual

Atualmente, a função `sendCancellationEmail` em `src/lib/supabase/tickets.ts` está configurada para apenas logar as informações do email que seria enviado. Isso permite testar a funcionalidade sem precisar de um provedor de email.

## Integrando com um Provedor de Email

Para ativar o envio real de emails, você pode integrar com serviços como:

### 1. Resend (Recomendado)

```bash
npm install resend
```

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendCancellationEmail = async (data: CancellationEmailData) => {
  await resend.emails.send({
    from: "noreply@seudominio.com",
    to: data.userEmail,
    subject: `Chamado #${data.ticketNumber} - Cancelado`,
    html: `
      <h2>Chamado Cancelado</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>Informamos que o seu chamado foi cancelado pelo administrador.</p>
      
      <h3>Detalhes do Chamado:</h3>
      <ul>
        <li><strong>Número:</strong> #${data.ticketNumber}</li>
        <li><strong>Setor:</strong> ${data.setor}</li>
        <li><strong>Descrição:</strong> ${data.description}</li>
        <li><strong>Cancelado por:</strong> ${data.adminName}</li>
        <li><strong>Data do cancelamento:</strong> ${new Date().toLocaleString(
          "pt-BR"
        )}</li>
      </ul>
      
      <p>Se você acredita que este cancelamento foi feito por engano, entre em contato com o suporte.</p>
      
      <p>Atenciosamente,<br>
      Equipe CRTE - Núcleo de Educação AMS</p>
    `,
  });
};
```

### 2. SendGrid

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendCancellationEmail = async (data: CancellationEmailData) => {
  await sgMail.send({
    to: data.userEmail,
    from: "noreply@seudominio.com",
    subject: `Chamado #${data.ticketNumber} - Cancelado`,
    html: "...", // mesmo conteúdo HTML
  });
};
```

### 3. Supabase (se usando Supabase Edge Functions)

```typescript
const sendCancellationEmail = async (data: CancellationEmailData) => {
  const response = await fetch(
    "https://sua-url-supabase.supabase.co/functions/v1/send-email",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Falha ao enviar email");
  }
};
```

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Para Resend
RESEND_API_KEY=re_xxxxxxxxx

# Para SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxx

# Email do remetente
FROM_EMAIL=noreply@seudominio.com
```

## Configuração no Arquivo env.ts

Adicione as novas variáveis ao arquivo `src/lib/env.ts`:

```typescript
export const env = {
  // ... outras variáveis existentes
  resendApiKey: readEnv("RESEND_API_KEY"),
  sendgridApiKey: readEnv("SENDGRID_API_KEY"),
  fromEmail: readEnv("FROM_EMAIL", { defaultValue: "noreply@localhost" }),
};
```

## Funcionalidades Implementadas

✅ **Botão de Cancelar**: Disponível na página de dashboard para administradores
✅ **Confirmação**: Modal de confirmação antes do cancelamento
✅ **Status Visual**: Chamados cancelados aparecem com cor vermelha
✅ **Estrutura de Email**: Template HTML pronto para envio
✅ **Dados do Email**: Coleta automática de dados do usuário e chamado
✅ **Tratamento de Erros**: Cancelamento funciona mesmo se email falhar

## Como Testar

1. Faça login como administrador
2. Acesse `/dashboard`
3. Localize um chamado ativo (não cancelado)
4. Clique no botão "Cancelar chamado"
5. Confirme o cancelamento
6. Verifique no console do servidor as informações do email que seria enviado
7. Observe que o status do chamado mudou para "Cancelado" com cor vermelha

## Próximos Passos

1. Escolha um provedor de email
2. Configure as credenciais de API
3. Substitua a função `sendCancellationEmail` pela implementação real
4. Teste o envio de emails em ambiente de desenvolvimento
5. Configure domínio de email em produção
