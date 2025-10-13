import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
    ensureUserProfile,
    getAllTickets,
    getAllUsers,
    getProfileById,
    updateTicket,
    updateUserRole,
    cancelTicket,
    assignTicketToTechnician,
    TicketStatus,
} from "@/lib/supabase/tickets";
import { LogoutButton } from "@/components/logout-button";
import { DashboardTicketsSection } from "@/components/dashboard-tickets-section";

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
    const users = await getAllUsers();

    async function handleUpdateTicket(formData: FormData) {
        "use server";

        const ticketId = formData.get("ticket_id");
        const statusField = formData.get("status");
        const technicianField = formData.get("tecnico_responsavel");

        if (!ticketId || typeof ticketId !== "string") {
            throw new Error("Chamado inválido para atualização.");
        }

        const normalizedStatus = typeof statusField === "string" ? (statusField as TicketStatus) : undefined;

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

    async function handleUpdateUserRole(formData: FormData) {
        "use server";

        const userId = formData.get("user_id");
        const isAdminField = formData.get("is_admin");

        if (!userId || typeof userId !== "string") {
            throw new Error("Usuário inválido para atualização.");
        }

        const isAdmin = isAdminField === "true";

        await updateUserRole(userId, isAdmin);

        revalidatePath("/dashboard");
    }

    async function handleCancelTicket(ticketId: string) {
        "use server";

        const adminName = user?.fullName ?? user?.username ?? "Administrador";

        await cancelTicket(ticketId, adminName);

        revalidatePath("/dashboard");
    }

    async function handleAssignTicket(ticketId: string) {
        "use server";

        const technicianName = user?.fullName ?? user?.username ?? "Técnico";

        await assignTicketToTechnician(ticketId, technicianName);

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
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-300 md:text-right">
                            <p>{user.fullName ?? user.username ?? "Usuário"}</p>
                            <p className="text-xs text-slate-500">
                                {user.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                        <a
                            href="/perfil"
                            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                        >
                            Meu Perfil
                        </a>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
                <section className="grid gap-4">
                    <header className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-emerald-200">
                                Gerenciar usuários
                            </h2>
                            <p className="text-sm text-slate-400">
                                {users.length === 0
                                    ? "Nenhum usuário cadastrado."
                                    : `Total de ${users.length} usuário(s) cadastrado(s).`}
                            </p>
                        </div>
                    </header>

                    <div className="grid gap-4">
                        {users.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                                Nenhum usuário encontrado.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full rounded-lg border border-white/10 bg-slate-900">
                                    <thead className="border-b border-white/10 bg-slate-900/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                                Nome
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                                Cargo
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                                Cadastrado em
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {users.map((userItem) => (
                                            <tr key={userItem.id} className="hover:bg-slate-900/50">
                                                <td className="px-4 py-3 text-sm text-slate-200">
                                                    {userItem.full_name || "Nome não informado"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-300">
                                                    {userItem.email || "Email não informado"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${userItem.is_admin
                                                            ? "bg-emerald-500/20 text-emerald-200"
                                                            : "bg-slate-700 text-slate-300"
                                                            }`}
                                                    >
                                                        {userItem.is_admin ? "Administrador" : "Usuário"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-400">
                                                    {new Date(userItem.created_at).toLocaleDateString("pt-BR")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <form action={handleUpdateUserRole} className="inline-block">
                                                        <input type="hidden" name="user_id" value={userItem.id} />
                                                        <input
                                                            type="hidden"
                                                            name="is_admin"
                                                            value={userItem.is_admin ? "false" : "true"}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${userItem.is_admin
                                                                ? "bg-red-500/20 text-red-200 hover:bg-red-500/30"
                                                                : "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                                                                }`}
                                                        >
                                                            {userItem.is_admin ? "Remover admin" : "Tornar admin"}
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                <DashboardTicketsSection
                    tickets={tickets}
                    onUpdateTicket={handleUpdateTicket}
                    onCancelTicket={handleCancelTicket}
                    onAssignTicket={handleAssignTicket}
                    currentUserName={user?.fullName ?? user?.username ?? "Técnico"}
                />
            </main>
        </div>
    );
}
