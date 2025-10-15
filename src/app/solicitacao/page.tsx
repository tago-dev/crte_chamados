import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
    createTicket,
    ensureUserProfile,
    getProfileById,
    getTicketsForUser,
    TicketStatus,
    TicketType,
} from "@/lib/supabase/tickets";
import { LogoutButton } from "@/components/logout-button";
import { SolicitationForm } from "@/components/solicitation-form";

// Função auxiliar para converter status em texto legível
function getStatusLabel(status: TicketStatus): string {
    const statusMap: Record<TicketStatus, string> = {
        "aberto": "Aberto",
        "em_atendimento": "Em atendimento",
        "aguardando_os": "Aguardando OS",
        "resolvido": "Resolvido",
        "cancelado": "Cancelado",
    };
    return statusMap[status] || status;
}

type SolicitationPageProps = {
    searchParams?: {
        created?: string;
    };
};

export default async function SolicitationPage({
    searchParams,
}: SolicitationPageProps) {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
        return session.redirectToSignIn();
    }

    const ownerId = userId as string;

    const user = await currentUser();

    if (!user) {
        return redirect("/sign-in");
    }

    await ensureUserProfile({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? null,
        full_name: user.fullName ?? user.username ?? user.id,
    });

    const profile = await getProfileById(user.id);

    if (profile?.is_admin) {
        return redirect("/dashboard");
    }

    const tickets = await getTicketsForUser(user.id);
    const defaultSolicitante =
        user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? "Usuário";
    const today = new Date().toLocaleDateString("pt-BR");
    const success = searchParams?.created === "1";

    async function handleCreateTicket(formData: FormData) {
        "use server";

        const titulo = formData.get("titulo");
        const tipo = formData.get("tipo") as TicketType;
        const setor = formData.get("setor");
        const description = formData.get("description");
        const cpf = formData.get("cpf");
        const rg = formData.get("rg");
        const ip_maquina = formData.get("ip_maquina");

        if (!titulo || typeof titulo !== "string" || titulo.trim().length === 0) {
            throw new Error("Informe o título do chamado.");
        }

        if (!tipo || !["pedagogico", "tecnico"].includes(tipo)) {
            throw new Error("Tipo de solicitação é obrigatório");
        }

        if (!setor || typeof setor !== "string" || setor.trim().length === 0) {
            throw new Error("Informe o setor responsável pelo chamado.");
        }

        if (!description || typeof description !== "string" || description.trim().length === 0) {
            throw new Error("Descreva a solicitação antes de enviar.");
        }

        // Validações específicas por tipo
        if (tipo === "pedagogico") {
            if (!cpf || typeof cpf !== "string" || cpf.trim().length === 0) {
                throw new Error("Informe o CPF do solicitante.");
            }
            if (!rg || typeof rg !== "string" || rg.trim().length === 0) {
                throw new Error("Informe o RG do solicitante.");
            }
            // Limpar CPF (remover formatação)
            const cleanCpf = cpf.replace(/\D/g, '');
            if (cleanCpf.length !== 11) {
                throw new Error("CPF deve ter 11 dígitos.");
            }
        }

        if (tipo === "tecnico") {
            if (!ip_maquina || typeof ip_maquina !== "string" || ip_maquina.trim().length === 0) {
                throw new Error("IP da máquina é obrigatório para solicitações técnicas");
            }
        }

        // Para clientes, sempre criar com status "aberto" e dados padrão
        await createTicket({
            owner_id: ownerId,
            titulo: titulo.trim(),
            tipo: tipo,
            setor: setor.trim(),
            description: description.trim(),
            status: "aberto",
            solicitante: defaultSolicitante,
            cpf: tipo === "pedagogico" ? (cpf as string).replace(/\D/g, '') : null,
            rg: tipo === "pedagogico" ? (rg as string).trim() : null,
            ip_maquina: tipo === "tecnico" ? (ip_maquina as string).trim() : null,
            tecnico_responsavel: null,
        });

        revalidatePath("/solicitacao");
        redirect("/solicitacao?created=1");
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
            <header className="border-b border-white/10 bg-slate-950/80 px-6 py-6">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            CRTE · Núcleo de Educação AMS
                        </p>
                        <h1 className="text-2xl font-semibold text-emerald-200">
                            Registrar chamado
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-300 sm:text-right">
                            <p>{defaultSolicitante}</p>
                            <p className="text-xs text-slate-500">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
                <SolicitationForm
                    onSubmit={handleCreateTicket}
                    success={success}
                    today={today}
                />

                <section className="grid gap-4">
                    <header>
                        <h2 className="text-lg font-semibold text-emerald-200">Histórico de chamados</h2>
                        <p className="text-sm text-slate-400">
                            {tickets.length === 0
                                ? "Nenhum chamado enviado ainda."
                                : `Você possui ${tickets.length} chamado(s) registrados.`}
                        </p>
                    </header>

                    <div className="grid gap-4">
                        {tickets.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                                Envie o primeiro chamado para visualizar o histórico aqui.
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <article
                                    key={ticket.id}
                                    className="rounded-lg border border-white/10 bg-slate-900 p-5 shadow"
                                >
                                    <header className="flex flex-wrap items-start justify-between gap-4 text-sm text-slate-300">
                                        <div className="space-y-1">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Chamado Nº {ticket.ticket_number}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-semibold text-slate-100">
                                                    {ticket.titulo || "Sem título"}
                                                </h3>
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${ticket.tipo === "pedagogico"
                                                        ? "bg-emerald-500/20 text-emerald-200"
                                                        : "bg-blue-500/20 text-blue-200"
                                                    }`}>
                                                    {ticket.tipo === "pedagogico" ? "📚 Pedagógico" : "💻 Técnico"}
                                                </span>
                                            </div>
                                            <p>
                                                Setor: <span className="text-slate-100">{ticket.setor}</span>
                                            </p>
                                            <p>
                                                Status: <span className="text-slate-100">{getStatusLabel(ticket.status)}</span>
                                            </p>
                                            {ticket.tipo === "pedagogico" && (ticket.cpf || ticket.rg) && (
                                                <div className="text-xs text-slate-400">
                                                    {ticket.cpf && <p>CPF: {ticket.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</p>}
                                                    {ticket.rg && <p>RG: {ticket.rg}</p>}
                                                </div>
                                            )}
                                            {ticket.tipo === "tecnico" && ticket.ip_maquina && (
                                                <div className="text-xs text-slate-400">
                                                    <p>IP da máquina: {ticket.ip_maquina}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right text-xs text-slate-400">
                                            <p>Aberto em {new Date(ticket.created_at).toLocaleString("pt-BR")}</p>
                                            <p>Responsável: {ticket.tecnico_responsavel ?? "Não atribuído"}</p>
                                        </div>
                                    </header>
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                        {ticket.description}
                                    </p>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
