import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
    ensureUserProfile,
    getProfileById,
    getTechnicianStats,
    getAllTechniciansStats,
    getMonthlyStatsForTechnician,
} from "@/lib/supabase/tickets";
import { LogoutButton } from "@/components/logout-button";
import { ProfileStatsCard } from "@/components/profile-stats-card";
import { TechniciansStatsTable } from "@/components/technicians-stats-table";
import { MonthlyStatsChart } from "@/components/monthly-stats-chart";

export default async function ProfilePage() {
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

    const currentUserName = user.fullName ?? user.username ?? "Administrador";
    const userStats = await getTechnicianStats(currentUserName);
    const allTechniciansStats = await getAllTechniciansStats();
    const monthlyStats = await getMonthlyStatsForTechnician(currentUserName);

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
            <header className="border-b border-white/10 bg-slate-950/80 px-6 py-6">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            CRTE · Núcleo de Educação AMS
                        </p>
                        <h1 className="text-2xl font-semibold text-emerald-200">
                            Meu Perfil
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-300 md:text-right">
                            <p>{currentUserName}</p>
                            <p className="text-xs text-slate-500">
                                {user.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <nav className="border-b border-white/10 bg-slate-900/50 px-6 py-3">
                <div className="mx-auto flex w-full max-w-5xl gap-6">
                    <a
                        href="/dashboard"
                        className="text-sm text-slate-400 transition hover:text-emerald-200"
                    >
                        Dashboard
                    </a>
                    <span className="text-sm font-semibold text-emerald-200">
                        Meu Perfil
                    </span>
                </div>
            </nav>

            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
                <section className="grid gap-6">
                    <header>
                        <h2 className="text-lg font-semibold text-emerald-200">
                            Minhas Estatísticas
                        </h2>
                        <p className="text-sm text-slate-400">
                            Resumo dos chamados atribuídos e resolvidos por você.
                        </p>
                    </header>

                    <ProfileStatsCard stats={userStats} />
                </section>

                <section className="grid gap-6">
                    <header>
                        <h2 className="text-lg font-semibold text-emerald-200">
                            Histórico de Performance
                        </h2>
                        <p className="text-sm text-slate-400">
                            Evolução do seu desempenho ao longo dos últimos meses.
                        </p>
                    </header>

                    <MonthlyStatsChart
                        data={monthlyStats}
                        technicianName={currentUserName}
                    />
                </section>

                <section className="grid gap-6">
                    <header>
                        <h2 className="text-lg font-semibold text-emerald-200">
                            Estatísticas da Equipe
                        </h2>
                        <p className="text-sm text-slate-400">
                            Desempenho de todos os técnicos da equipe.
                        </p>
                    </header>

                    <TechniciansStatsTable technicians={allTechniciansStats} />
                </section>
            </main>
        </div>
    );
}