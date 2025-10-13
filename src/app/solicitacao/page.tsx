import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
    createTicket,
    ensureUserProfile,
    getProfileById,
    getTicketsForUser,
    updateUserProfile,
    TicketStatus,
} from "@/lib/supabase/tickets";
import { LogoutButton } from "@/components/logout-button";
import { CPFInput } from "@/components/cpf-input";

const SECTORS = [
    "CHEFIA",
    "EDIFICAÇÕES",
    "RECURSOS HUMANOS",
    "NAS PONTUAL",
    "NAS PATRIMÔNIO",
    "TUTORIA",
    "FINANCEIRO",
    "EDUCAÇÃO PROFISSIONAL",
    "NCPM",
    "EJA",
    "ESTRUTURA",
    "CPADS",
    "RH",
    "PEDAGÓGICO",
    "REDS",
    "SERE",
    "PROTOCOLO",
    "OUVIDORIA",
    "FORMADORES",
    "EDUCAÇÃO ESPECIAL",
] as const;

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

    async function handleUpdateProfile(formData: FormData) {
        "use server";

        const fullName = formData.get("full_name");
        const cpf = formData.get("cpf");
        const rg = formData.get("rg");

        const profileData: any = {};

        if (typeof fullName === "string" && fullName.trim()) {
            profileData.full_name = fullName.trim();
        }

        if (typeof cpf === "string" && cpf.trim()) {
            // Remove formatação do CPF (apenas números)
            const cleanCpf = cpf.replace(/\D/g, '');
            if (cleanCpf.length === 11) {
                profileData.cpf = cleanCpf;
            }
        }

        if (typeof rg === "string" && rg.trim()) {
            profileData.rg = rg.trim();
        }

        if (Object.keys(profileData).length > 0 && user?.id) {
            await updateUserProfile(user.id, profileData);
            revalidatePath("/solicitacao");
        }
    }

    async function handleCreateTicket(formData: FormData) {
        "use server";

        const setor = formData.get("setor");
        const description = formData.get("description");

        if (!setor || typeof setor !== "string" || setor.trim().length === 0) {
            throw new Error("Informe o setor responsável pelo chamado.");
        }

        if (!description || typeof description !== "string" || description.trim().length === 0) {
            throw new Error("Descreva a solicitação antes de enviar.");
        }

        // Para clientes, sempre criar com status "aberto" e dados padrão
        await createTicket({
            owner_id: ownerId,
            setor: setor.trim(),
            description: description.trim(),
            status: "aberto",
            solicitante: defaultSolicitante,
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
                <section className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-emerald-200">Dados Pessoais</h2>
                            <p className="text-sm text-slate-400">
                                Mantenha suas informações atualizadas.
                            </p>
                        </div>
                    </div>

                    <form action={handleUpdateProfile} className="mt-6 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Nome Completo
                            </label>
                            <input
                                name="full_name"
                                type="text"
                                defaultValue={profile?.full_name || ""}
                                placeholder="Digite seu nome completo"
                                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                CPF
                            </label>
                            <CPFInput
                                name="cpf"
                                defaultValue={profile?.cpf ? profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : ""}
                                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                RG
                            </label>
                            <input
                                name="rg"
                                type="text"
                                defaultValue={profile?.rg || ""}
                                placeholder="Digite seu RG"
                                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Email
                            </label>
                            <input
                                type="email"
                                value={user.primaryEmailAddress?.emailAddress || ""}
                                disabled
                                className="mt-1 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                                Salvar alterações
                            </button>
                        </div>
                    </form>
                </section>

                <section className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-emerald-200">Novo chamado</h2>
                            <p className="text-sm text-slate-400">
                                Preencha os campos abaixo para abrir um chamado junto ao CRTE.
                            </p>
                        </div>
                        {success ? (
                            <span className="rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                                Chamado registrado com sucesso!
                            </span>
                        ) : null}
                    </div>

                    <form action={handleCreateTicket} className="mt-6 grid gap-4">
                        <label className="grid gap-2 text-sm">
                            <span>Setor</span>
                            <select
                                name="setor"
                                required
                                className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Selecione um setor
                                </option>
                                {SECTORS.map((sector) => (
                                    <option key={sector} value={sector}>
                                        {sector}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid gap-2 text-sm">
                            <span>Descrição</span>
                            <textarea
                                name="description"
                                placeholder="Detalhe a solicitação"
                                rows={4}
                                required
                                className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2 text-sm">
                                <span>Data de abertura</span>
                                <input
                                    value={today}
                                    readOnly
                                    className="rounded-md border border-dashed border-white/10 bg-slate-900 px-4 py-2 text-slate-400"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                <span>Nº do chamado</span>
                                <input
                                    value="Gerado automaticamente"
                                    readOnly
                                    className="rounded-md border border-dashed border-white/10 bg-slate-900 px-4 py-2 text-slate-400"
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
                        >
                            Enviar chamado
                        </button>
                    </form>
                </section>

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
                                            <h3 className="text-base font-semibold text-slate-100">
                                                Setor: {ticket.setor}
                                            </h3>
                                            <p>
                                                Status: <span className="text-slate-100">{getStatusLabel(ticket.status)}</span>
                                            </p>
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
