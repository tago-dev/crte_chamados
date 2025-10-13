"use client";

import { MonthlyStats } from "@/lib/supabase/tickets";

type MonthlyStatsChartProps = {
    data: MonthlyStats[];
    technicianName: string;
};

export function MonthlyStatsChart({ data, technicianName }: MonthlyStatsChartProps) {
    if (data.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
                Nenhum dado histórico disponível.
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => Math.max(d.assigned, d.resolved)));
    const chartHeight = 200;

    return (
        <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-200">
                    Histórico Mensal - {technicianName}
                </h3>
                <p className="text-sm text-slate-400">
                    Chamados atribuídos vs resolvidos nos últimos 6 meses
                </p>
            </div>

            <div className="relative">
                {/* Legend */}
                <div className="mb-4 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                        <span className="text-sm text-slate-300">Atribuídos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                        <span className="text-sm text-slate-300">Resolvidos</span>
                    </div>
                </div>

                {/* Chart */}
                <div className="flex items-end justify-between gap-4" style={{ height: `${chartHeight}px` }}>
                    {data.map((monthData, index) => {
                        const assignedHeight = maxValue > 0 ? (monthData.assigned / maxValue) * (chartHeight - 40) : 0;
                        const resolvedHeight = maxValue > 0 ? (monthData.resolved / maxValue) * (chartHeight - 40) : 0;

                        return (
                            <div key={index} className="flex flex-1 flex-col items-center gap-2">
                                <div className="flex w-full items-end justify-center gap-1">
                                    {/* Assigned Bar */}
                                    <div className="relative flex flex-1 flex-col items-center">
                                        <div
                                            className="w-full rounded-t bg-blue-400/80 transition-all hover:bg-blue-400"
                                            style={{ height: `${assignedHeight}px` }}
                                            title={`${monthData.assigned} atribuídos`}
                                        />
                                        {assignedHeight > 20 && (
                                            <span className="absolute bottom-1 text-xs font-semibold text-slate-900">
                                                {monthData.assigned}
                                            </span>
                                        )}
                                    </div>

                                    {/* Resolved Bar */}
                                    <div className="relative flex flex-1 flex-col items-center">
                                        <div
                                            className="w-full rounded-t bg-emerald-400/80 transition-all hover:bg-emerald-400"
                                            style={{ height: `${resolvedHeight}px` }}
                                            title={`${monthData.resolved} resolvidos`}
                                        />
                                        {resolvedHeight > 20 && (
                                            <span className="absolute bottom-1 text-xs font-semibold text-slate-900">
                                                {monthData.resolved}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Month Label */}
                                <span className="text-xs text-slate-400">
                                    {monthData.month}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-2 text-xs text-slate-500">
                    <span>{maxValue}</span>
                    <span>{Math.round(maxValue * 0.5)}</span>
                    <span>0</span>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                        {data.reduce((sum, d) => sum + d.assigned, 0)}
                    </p>
                    <p className="text-sm text-slate-400">Total Atribuídos</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                        {data.reduce((sum, d) => sum + d.resolved, 0)}
                    </p>
                    <p className="text-sm text-slate-400">Total Resolvidos</p>
                </div>
            </div>
        </div>
    );
}