import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
    ensureUserProfile,
    getAllTickets,
    getProfileById,
    updateTicket,
    TicketStatus,
} from "@/lib/supabase/tickets";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
    { value: "aberto", label: "Aberto" },
    { value: "em_atendimento", label: "Em atendimento" },
    { value: "resolvido", label: "Resolvido" },
];

export default async function DashboardPage() {
    const session = await auth();
    const { userId } = session;

    if (!userId) {
        return session.redirectToSignIn();
    }

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

    if (!profile?.is_admin) {
        return redirect("/solicitacao");
    }

    const tickets = await getAllTickets();

    const statusLabel = STATUS_OPTIONS.reduce<Record<string, string>>((acc, option) => {
        acc[option.value] = option.label;
        return acc;
    }, {});

    async function handleUpdateTicket(formData: FormData) {
        "use server";

        const ticketId = formData.get("ticket_id");
        const statusField = formData.get("status");
        const technicianField = formData.get("tecnico_responsavel");

        if (!ticketId || typeof ticketId !== "string") {
            throw new Error("Chamado inválido para atualização.");
        }

        const normalizedStatus =
            typeof statusField === "string" &&
                STATUS_OPTIONS.some((option) => option.value === statusField)
                ? (statusField as TicketStatus)
                : undefined;

        let technicianValue: string | null | undefined = undefined;

        if (typeof technicianField === "string") {
            const trimmed = technicianField.trim();
            technicianValue = trimmed.length > 0 ? trimmed : null;
        }

        await updateTicket({
            id: ticketId,
            status: normalizedStatus,
            tecnico_responsavel: technicianValue,
        });

        revalidatePath("/dashboard");
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
            <header className="border-b border-white/10 bg-slate-950/80 px-6 py-6">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            CRTE · Núcleo de Educação AMS
                        </p>
                        <h1 className="text-2xl font-semibold text-emerald-200">
                            Painel de Chamados
                        </h1>
                    </div>
                    <div className="text-sm text-slate-300 md:text-right">
                        <p>{user.fullName ?? user.username ?? "Usuário"}</p>
                        <p className="text-xs text-slate-500">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
                <section className="grid gap-4">
                    <header className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-emerald-200">
                                Chamados registrados
                            </h2>
                            <p className="text-sm text-slate-400">
                                {tickets.length === 0
                                    ? "Nenhum chamado cadastrado."
                                    : `Total de ${tickets.length} chamado(s).`}
                            </p>
                        </div>
                    </header>

                    <div className="grid gap-4">
                        {tickets.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                                Registre o primeiro chamado para visualizar o histórico aqui.
                            </div>
                        ) : (
                            tickets.map((ticket) => (
                                <article
                                    key={ticket.id}
                                    className="rounded-lg border border-white/10 bg-slate-900 p-5 shadow"
                                >
                                    <header className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-1 text-sm text-slate-300">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Chamado Nº {ticket.ticket_number}
                                            </p>
                                            <h3 className="text-base font-semibold text-slate-100">
                                                Setor: {ticket.setor}
                                            </h3>
                                            <p>
                                                Solicitante: <span className="text-slate-100">{ticket.solicitante}</span>
                                            </p>
                                            <p>
                                                Técnico responsável: {ticket.tecnico_responsavel ? (
                                                    <span className="text-slate-100">{ticket.tecnico_responsavel}</span>
                                                ) : (
                                                    <span className="italic text-slate-500">Não atribuído</span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 text-xs text-slate-400">
                                            <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                                                {statusLabel[ticket.status] ?? ticket.status}
                                            </span>
                                            <span>
                                                Aberto em {new Date(ticket.created_at).toLocaleString("pt-BR")}
                                            </span>
                                        </div>
                                    </header>
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                        {ticket.description}
                                    </p>
                                    <form
                                        action={handleUpdateTicket}
                                        className="mt-5 grid gap-3 rounded-lg border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300"
                                    >
                                        <input type="hidden" name="ticket_id" value={ticket.id} />

                                        <label className="grid gap-2">
                                            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Atualizar status
                                            </span>
                                            <select
                                                name="status"
                                                defaultValue={ticket.status}
                                                className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                                            >
                                                {STATUS_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="grid gap-2">
                                            <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Técnico responsável
                                            </span>
                                            <input
                                                name="tecnico_responsavel"
                                                defaultValue={ticket.tecnico_responsavel ?? ""}
                                                placeholder="Informe um nome ou deixe em branco"
                                                className="rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            className="justify-self-start rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
                                        >
                                            Salvar alterações
                                        </button>
                                    </form>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
