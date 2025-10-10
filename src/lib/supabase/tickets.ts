import { cache } from "react";
import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";

export type TicketStatus = "aberto" | "em_atendimento" | "resolvido";

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

  const validStatuses: TicketStatus[] = ["aberto", "em_atendimento", "resolvido"];
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
    const validStatuses: TicketStatus[] = ["aberto", "em_atendimento", "resolvido"];
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
