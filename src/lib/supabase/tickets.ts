import { cache } from "react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export type TicketStatus = "aberto" | "em_atendimento" | "aguardando_os" | "resolvido" | "cancelado";

export type TicketRecord = {
  id: string;
  ticket_number: number;
  owner_id: string;
  setor: string;
  description: string;
  status: TicketStatus;
  solicitante: string;
  tecnico_responsavel: string | null;
  created_at: string;
};

export type ProfileRecord = {
  id: string;
  email: string | null;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export const ensureUserProfile = async (
  params: Pick<ProfileRecord, "id" | "email" | "full_name">
) => {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: params.id,
        email: params.email,
        full_name: params.full_name,
      },
      { onConflict: "id" }
    );

  if (error) {
    throw new Error(`Não foi possível sincronizar o perfil no Supabase: ${error.message}`);
  }
};

export const getProfileById = cache(async (id: string) => {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Não foi possível carregar o perfil do Supabase: ${error.message}`);
  }

  return (data ?? null) as ProfileRecord | null;
});

export const getTicketsForUser = cache(async (ownerId: string) => {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("tickets")
    .select(
      "id, ticket_number, owner_id, setor, description, status, solicitante, tecnico_responsavel, created_at"
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível carregar os chamados do Supabase: ${error.message}`);
  }

  return (data ?? []) as TicketRecord[];
});

export const getAllTickets = cache(async () => {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("tickets")
    .select(
      "id, ticket_number, owner_id, setor, description, status, solicitante, tecnico_responsavel, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível carregar os chamados do Supabase: ${error.message}`);
  }

  return (data ?? []) as TicketRecord[];
});

export const createTicket = async (
  ticket: Pick<
    TicketRecord,
    "owner_id" | "setor" | "description" | "status" | "solicitante" | "tecnico_responsavel"
  >
) => {
  const supabase = getSupabaseAdminClient();

  const validStatuses: TicketStatus[] = ["aberto", "em_atendimento", "resolvido", "cancelado"];
  const safeStatus = validStatuses.includes(ticket.status) ? ticket.status : "aberto";

  const { error } = await supabase.from("tickets").insert({
    owner_id: ticket.owner_id,
    setor: ticket.setor,
    description: ticket.description,
    status: safeStatus,
    solicitante: ticket.solicitante,
    tecnico_responsavel: ticket.tecnico_responsavel,
  });

  if (error) {
    throw new Error(`Erro ao criar chamado: ${error.message}`);
  }
};

type UpdateTicketParams = {
  id: string;
  status?: TicketStatus;
  tecnico_responsavel?: string | null;
};

export const updateTicket = async ({ id, status, tecnico_responsavel }: UpdateTicketParams) => {
  const supabase = getSupabaseAdminClient();

  const updates: Partial<Pick<TicketRecord, "status" | "tecnico_responsavel">> = {};

  if (typeof status !== "undefined") {
    const validStatuses: TicketStatus[] = ["aberto", "em_atendimento", "resolvido", "cancelado"];
    updates.status = validStatuses.includes(status) ? status : "aberto";
  }

  if (typeof tecnico_responsavel !== "undefined") {
    updates.tecnico_responsavel = tecnico_responsavel ?? null;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase.from("tickets").update(updates).eq("id", id);

  if (error) {
    throw new Error(`Erro ao atualizar chamado: ${error.message}`);
  }
};

export const getAllUsers = cache(async () => {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_admin, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível carregar os usuários do Supabase: ${error.message}`);
  }

  return (data ?? []) as ProfileRecord[];
});

export const updateUserRole = async (userId: string, isAdmin: boolean) => {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) {
    throw new Error(`Erro ao atualizar papel do usuário: ${error.message}`);
  }
};

export const cancelTicket = async (ticketId: string, adminName: string) => {
  const supabase = getSupabaseAdminClient();

  // Primeiro, vamos buscar os detalhes do chamado para obter o email do usuário
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      setor,
      description,
      solicitante,
      status,
      owner_id
    `)
    .eq("id", ticketId)
    .single();

  if (ticketError || !ticket) {
    throw new Error(`Erro ao buscar dados do chamado: ${ticketError?.message || 'Chamado não encontrado'}`);
  }

  // Buscar dados do perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", ticket.owner_id)
    .single();

  if (profileError) {
    throw new Error(`Erro ao buscar dados do usuário: ${profileError.message}`);
  }

  // Verifica se o chamado já está cancelado
  if (ticket.status === "cancelado") {
    throw new Error("Este chamado já foi cancelado.");
  }

  // Atualiza o status do chamado para cancelado
  const { error: updateError } = await supabase
    .from("tickets")
    .update({ status: "cancelado" })
    .eq("id", ticketId);

  if (updateError) {
    throw new Error(`Erro ao cancelar chamado: ${updateError.message}`);
  }

  // Envia email de notificação para o usuário
  try {
    await sendCancellationEmail({
      ticketNumber: ticket.ticket_number,
      userEmail: profile?.email || '',
      userName: profile?.full_name || ticket.solicitante,
      setor: ticket.setor,
      description: ticket.description,
      adminName
    });
  } catch (emailError) {
    // Log do erro do email, mas não falha a operação de cancelamento
    console.error('Erro ao enviar email de cancelamento:', emailError);
  }
};

type CancellationEmailData = {
  ticketNumber: number;
  userEmail: string;
  userName: string;
  setor: string;
  description: string;
  adminName: string;
};

const sendCancellationEmail = async (data: CancellationEmailData) => {
  // Para este exemplo, vou implementar uma função básica que pode ser integrada
  // com um serviço de email como SendGrid, Resend, ou outro provedor
  // Por agora, vou apenas logar a informação que seria enviada
  
  const emailContent = {
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
        <li><strong>Data do cancelamento:</strong> ${new Date().toLocaleString('pt-BR')}</li>
      </ul>
      
      <p>Se você acredita que este cancelamento foi feito por engano, entre em contato com o suporte.</p>
      
      <p>Atenciosamente,<br>
      Equipe CRTE - Núcleo de Educação AMS</p>
    `
  };

  // TODO: Integrar com serviço de email real
  console.log('Email de cancelamento a ser enviado:', emailContent);
  
  // Exemplo de como seria com um serviço real (comentado):
  // const response = await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(emailContent)
  // });
  // 
  // if (!response.ok) {
  //   throw new Error('Falha ao enviar email');
  // }
};
