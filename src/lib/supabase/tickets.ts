import { cache } from "react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export type TicketStatus = "aberto" | "em_atendimento" | "aguardando_os" | "resolvido" | "cancelado";

export type TicketRecord = {
  id: string;
  ticket_number: number;
  owner_id: string;
  titulo: string;
  setor: string;
  description: string;
  status: TicketStatus;
  solicitante: string;
  cpf: string;
  rg: string;
  tecnico_responsavel: string | null;
  os_celepar: string | null;
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
      "id, ticket_number, owner_id, titulo, setor, description, status, solicitante, cpf, rg, tecnico_responsavel, os_celepar, created_at"
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível carregar os chamados do Supabase: ${error.message}`);
  }

  return data as TicketRecord[];
});

export const getAllTickets = cache(async () => {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("tickets")
    .select(
      "id, ticket_number, owner_id, titulo, setor, description, status, solicitante, cpf, rg, tecnico_responsavel, os_celepar, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível carregar os chamados do Supabase: ${error.message}`);
  }

  return data as TicketRecord[];
});

export const createTicket = async (
  ticket: Pick<
    TicketRecord,
    "owner_id" | "titulo" | "setor" | "description" | "status" | "solicitante" | "cpf" | "rg" | "tecnico_responsavel"
  >
) => {
  const supabase = getSupabaseAdminClient();

  const validStatuses: TicketStatus[] = ["aberto", "em_atendimento", "aguardando_os", "resolvido", "cancelado"];
  const safeStatus = validStatuses.includes(ticket.status) ? ticket.status : "aberto";

  const { error } = await supabase.from("tickets").insert({
    owner_id: ticket.owner_id,
    titulo: ticket.titulo,
    setor: ticket.setor,
    description: ticket.description,
    status: safeStatus,
    solicitante: ticket.solicitante,
    cpf: ticket.cpf,
    rg: ticket.rg,
    tecnico_responsavel: ticket.tecnico_responsavel,
    os_celepar: null,
  });

  if (error) {
    throw new Error(`Erro ao criar chamado: ${error.message}`);
  }
};

type UpdateTicketParams = {
  id: string;
  status?: TicketStatus;
  tecnico_responsavel?: string | null;
  os_celepar?: string | null;
};

export const updateTicket = async ({ id, status, tecnico_responsavel, os_celepar }: UpdateTicketParams) => {
  const supabase = getSupabaseAdminClient();

  const updates: Partial<Pick<TicketRecord, "status" | "tecnico_responsavel" | "os_celepar">> = {};

  if (typeof status !== "undefined") {
    const validStatuses: TicketStatus[] = ["aberto", "em_atendimento", "aguardando_os", "resolvido", "cancelado"];
    updates.status = validStatuses.includes(status) ? status : "aberto";
  }

  if (typeof tecnico_responsavel !== "undefined") {
    updates.tecnico_responsavel = tecnico_responsavel ?? null;
  }

  if (typeof os_celepar !== "undefined") {
    updates.os_celepar = os_celepar ?? null;
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

export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<Pick<ProfileRecord, "full_name">>
) => {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId);

  if (error) {
    throw new Error(`Erro ao atualizar perfil do usuário: ${error.message}`);
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
      titulo,
      setor,
      description,
      solicitante,
      cpf,
      rg,
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

export const assignTicketToTechnician = async (ticketId: string, technicianName: string) => {
  const supabase = getSupabaseAdminClient();

  // Primeiro, vamos buscar os detalhes do chamado para obter o email do usuário
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select(`
      id,
      ticket_number,
      titulo,
      setor,
      description,
      solicitante,
      cpf,
      rg,
      status,
      owner_id,
      tecnico_responsavel
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

  // Verifica se o chamado já foi cancelado ou resolvido
  if (ticket.status === "cancelado" || ticket.status === "resolvido") {
    throw new Error("Este chamado não pode ser atribuído pois já foi cancelado ou resolvido.");
  }

  // Verifica se o chamado já está atribuído a outro técnico
  if (ticket.tecnico_responsavel && ticket.tecnico_responsavel !== technicianName) {
    throw new Error(`Este chamado já está atribuído a: ${ticket.tecnico_responsavel}`);
  }

  // Atualiza o chamado com o técnico responsável e status
  const { error: updateError } = await supabase
    .from("tickets")
    .update({ 
      tecnico_responsavel: technicianName,
      status: "em_atendimento"
    })
    .eq("id", ticketId);

  if (updateError) {
    throw new Error(`Erro ao atribuir chamado: ${updateError.message}`);
  }

  // Envia email de notificação para o usuário
  try {
    await sendAssignmentEmail({
      ticketNumber: ticket.ticket_number,
      userEmail: profile?.email || '',
      userName: profile?.full_name || ticket.solicitante,
      setor: ticket.setor,
      description: ticket.description,
      technicianName
    });
  } catch (emailError) {
    // Log do erro do email, mas não falha a operação de atribuição
    console.error('Erro ao enviar email de atribuição:', emailError);
  }
};

type AssignmentEmailData = {
  ticketNumber: number;
  userEmail: string;
  userName: string;
  setor: string;
  description: string;
  technicianName: string;
};

const sendAssignmentEmail = async (data: AssignmentEmailData) => {
  const emailContent = {
    to: data.userEmail,
    subject: `Chamado #${data.ticketNumber} - Atribuído para atendimento`,
    html: `
      <h2>Chamado Atribuído</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>Informamos que o seu chamado foi atribuído para atendimento.</p>
      
      <h3>Detalhes do Chamado:</h3>
      <ul>
        <li><strong>Número:</strong> #${data.ticketNumber}</li>
        <li><strong>Setor:</strong> ${data.setor}</li>
        <li><strong>Descrição:</strong> ${data.description}</li>
        <li><strong>Técnico responsável:</strong> ${data.technicianName}</li>
        <li><strong>Status:</strong> Em atendimento</li>
        <li><strong>Data de atribuição:</strong> ${new Date().toLocaleString('pt-BR')}</li>
      </ul>
      
      <p>O técnico responsável entrará em contato em breve para dar andamento ao seu chamado.</p>
      
      <p>Atenciosamente,<br>
      Equipe CRTE - Núcleo de Educação AMS</p>
    `
  };

  // TODO: Integrar com serviço de email real
  console.log('Email de atribuição a ser enviado:', emailContent);
  
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

export type TechnicianStats = {
  technicianName: string;
  assignedTickets: number;
  resolvedTickets: number;
  inProgressTickets: number;
  avgResolutionTime?: number; // em dias
};

export const getTechnicianStats = cache(async (technicianName: string): Promise<TechnicianStats> => {
  const supabase = getSupabaseAdminClient();

  // Buscar todos os chamados atribuídos ao técnico
  const { data: assignedTickets, error: assignedError } = await supabase
    .from("tickets")
    .select("id, status, created_at")
    .eq("tecnico_responsavel", technicianName);

  if (assignedError) {
    throw new Error(`Erro ao buscar chamados atribuídos: ${assignedError.message}`);
  }

  // Buscar chamados resolvidos pelo técnico
  const { data: resolvedTickets, error: resolvedError } = await supabase
    .from("tickets")
    .select("id, created_at")
    .eq("tecnico_responsavel", technicianName)
    .eq("status", "resolvido");

  if (resolvedError) {
    throw new Error(`Erro ao buscar chamados resolvidos: ${resolvedError.message}`);
  }

  // Buscar chamados em andamento
  const { data: inProgressTickets, error: inProgressError } = await supabase
    .from("tickets")
    .select("id")
    .eq("tecnico_responsavel", technicianName)
    .eq("status", "em_atendimento");

  if (inProgressError) {
    throw new Error(`Erro ao buscar chamados em andamento: ${inProgressError.message}`);
  }

  // Calcular tempo médio de resolução (exemplo simplificado)
  let avgResolutionTime: number | undefined;
  if (resolvedTickets && resolvedTickets.length > 0) {
    const totalDays = resolvedTickets.reduce((acc, ticket) => {
      const createdDate = new Date(ticket.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    avgResolutionTime = Math.round(totalDays / resolvedTickets.length);
  }

  return {
    technicianName,
    assignedTickets: assignedTickets?.length || 0,
    resolvedTickets: resolvedTickets?.length || 0,
    inProgressTickets: inProgressTickets?.length || 0,
    avgResolutionTime,
  };
});

export const getAllTechniciansStats = cache(async (): Promise<TechnicianStats[]> => {
  const supabase = getSupabaseAdminClient();

  // Buscar todos os técnicos únicos
  const { data: technicians, error } = await supabase
    .from("tickets")
    .select("tecnico_responsavel")
    .not("tecnico_responsavel", "is", null);

  if (error) {
    throw new Error(`Erro ao buscar técnicos: ${error.message}`);
  }

  // Obter técnicos únicos
  const uniqueTechnicians = [...new Set(technicians?.map(t => t.tecnico_responsavel).filter(Boolean) || [])];

  // Buscar estatísticas para cada técnico
  const statsPromises = uniqueTechnicians.map(technicianName => 
    getTechnicianStats(technicianName)
  );

  return await Promise.all(statsPromises);
});

export type MonthlyStats = {
  month: string;
  year: number;
  resolved: number;
  assigned: number;
};

export const getMonthlyStatsForTechnician = cache(async (technicianName: string): Promise<MonthlyStats[]> => {
  const supabase = getSupabaseAdminClient();

  // Buscar chamados dos últimos 6 meses
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("created_at, status, tecnico_responsavel")
    .eq("tecnico_responsavel", technicianName)
    .gte("created_at", sixMonthsAgo.toISOString());

  if (error) {
    throw new Error(`Erro ao buscar histórico de chamados: ${error.message}`);
  }

  // Agrupar por mês
  const monthlyData: Record<string, MonthlyStats> = {};

  tickets?.forEach(ticket => {
    const date = new Date(ticket.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthName,
        year: date.getFullYear(),
        resolved: 0,
        assigned: 0,
      };
    }

    monthlyData[monthKey].assigned++;
    if (ticket.status === 'resolvido') {
      monthlyData[monthKey].resolved++;
    }
  });

  // Converter para array e ordenar por data
  return Object.values(monthlyData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month.localeCompare(b.month);
  });
});
