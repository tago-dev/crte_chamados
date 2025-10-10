import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
    createTicket,
    ensureUserProfile,
    getProfileById,
    getTicketsForUser,
    TicketStatus,
} from "@/lib/supabase/tickets";

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

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
    { value: "aberto", label: "Aberto" },
    { value: "em_atendimento", label: "Em atendimento" },
    { value: "resolvido", label: "Resolvido" },
];

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

        const setor = formData.get("setor");
        const description = formData.get("description");
        const status = formData.get("status");
        const solicitanteField = formData.get("solicitante");
        const tecnicoField = formData.get("tecnico_responsavel");

        if (!setor || typeof setor !== "string" || setor.trim().length === 0) {
            throw new Error("Informe o setor responsável pelo chamado.");
        }

        if (!description || typeof description !== "string" || description.trim().length === 0) {
            throw new Error("Descreva a solicitação antes de enviar.");
        }

        const normalizedStatus = STATUS_OPTIONS.some((option) => option.value === status)
            ? (status as TicketStatus)
            : "aberto";

        const solicitante =
            typeof solicitanteField === "string" && solicitanteField.trim().length > 0
                ? solicitanteField.trim()
                : defaultSolicitante;

        const tecnico =
            typeof tecnicoField === "string" && tecnicoField.trim().length > 0
                ? tecnicoField.trim()
                : null;

        await createTicket({
            owner_id: ownerId,
            setor: setor.trim(),
            description: description.trim(),
            status: normalizedStatus,
            solicitante,
            tecnico_responsavel: tecnico,
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
                    <div className="text-sm text-slate-300 sm:text-right">
                        <p>{defaultSolicitante}</p>
                        <p className="text-xs text-slate-500">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
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

                        <label className="grid gap-2 text-sm">
                            <span>Status</span>
                            <select
                                name="status"
                                defaultValue="aberto"
                                className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="grid gap-2 text-sm">
                            <span>Solicitante</span>
                            <input
                                name="solicitante"
                                defaultValue={defaultSolicitante}
                                className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                            />
                        </label>

                        <label className="grid gap-2 text-sm">
                            <span>Técnico responsável</span>
                            <input
                                name="tecnico_responsavel"
                                placeholder="Opcional"
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
                                                Status: <span className="text-slate-100">{STATUS_OPTIONS.find((opt) => opt.value === ticket.status)?.label ?? ticket.status}</span>
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
