"use client";

import { TechnicianStats } from "@/lib/supabase/tickets";

type ProfileStatsCardProps = {
    stats: TechnicianStats;
};

export function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
    const getEfficiencyPercentage = () => {
        if (stats.assignedTickets === 0) return 0;
        return Math.round((stats.resolvedTickets / stats.assignedTickets) * 100);
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400">Chamados Atribuídos</p>
                        <p className="text-3xl font-bold text-slate-100">{stats.assignedTickets}</p>
                    </div>
                    <div className="rounded-full bg-blue-500/20 p-3">
                        <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400">Chamados Resolvidos</p>
                        <p className="text-3xl font-bold text-emerald-400">{stats.resolvedTickets}</p>
                    </div>
                    <div className="rounded-full bg-emerald-500/20 p-3">
                        <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400">Em Andamento</p>
                        <p className="text-3xl font-bold text-yellow-400">{stats.inProgressTickets}</p>
                    </div>
                    <div className="rounded-full bg-yellow-500/20 p-3">
                        <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-400">Taxa de Resolução</p>
                        <p className="text-3xl font-bold text-purple-400">{getEfficiencyPercentage()}%</p>
                    </div>
                    <div className="rounded-full bg-purple-500/20 p-3">
                        <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                </div>
            </div>

            {stats.avgResolutionTime && (
                <div className="rounded-xl border border-white/10 bg-slate-900 p-6 md:col-span-2 lg:col-span-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-400">Tempo Médio de Resolução</p>
                            <p className="text-2xl font-bold text-slate-100">
                                {stats.avgResolutionTime} {stats.avgResolutionTime === 1 ? 'dia' : 'dias'}
                            </p>
                        </div>
                        <div className="rounded-full bg-indigo-500/20 p-3">
                            <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}