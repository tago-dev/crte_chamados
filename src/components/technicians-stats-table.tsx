"use client";

import { useState } from "react";
import { TechnicianStats } from "@/lib/supabase/tickets";

type TechniciansStatsTableProps = {
    technicians: TechnicianStats[];
};

export function TechniciansStatsTable({ technicians }: TechniciansStatsTableProps) {
    const [sortField, setSortField] = useState<keyof TechnicianStats>("resolvedTickets");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const handleSort = (field: keyof TechnicianStats) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    const sortedTechnicians = [...technicians].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const getEfficiencyPercentage = (stats: TechnicianStats) => {
        if (stats.assignedTickets === 0) return 0;
        return Math.round((stats.resolvedTickets / stats.assignedTickets) * 100);
    };

    const getEfficiencyColor = (percentage: number) => {
        if (percentage >= 80) return "text-emerald-400";
        if (percentage >= 60) return "text-yellow-400";
        if (percentage >= 40) return "text-orange-400";
        return "text-red-400";
    };

    if (technicians.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
                Nenhum técnico encontrado com chamados atribuídos.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-slate-400">
                Mostrando {technicians.length} técnico(s) com chamados atribuídos
            </div>

            <div className="overflow-x-auto">
                <table className="w-full rounded-lg border border-white/10 bg-slate-900">
                    <thead className="border-b border-white/10 bg-slate-900/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                Técnico
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                onClick={() => handleSort("assignedTickets")}
                            >
                                Atribuídos
                                {sortField === "assignedTickets" && (
                                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                )}
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                onClick={() => handleSort("resolvedTickets")}
                            >
                                Resolvidos
                                {sortField === "resolvedTickets" && (
                                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                )}
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                onClick={() => handleSort("inProgressTickets")}
                            >
                                Em Andamento
                                {sortField === "inProgressTickets" && (
                                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                )}
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                Taxa de Resolução
                            </th>
                            <th
                                className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                onClick={() => handleSort("avgResolutionTime")}
                            >
                                Tempo Médio
                                {sortField === "avgResolutionTime" && (
                                    <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {sortedTechnicians.map((tech, index) => {
                            const efficiency = getEfficiencyPercentage(tech);
                            return (
                                <tr key={tech.technicianName} className="hover:bg-slate-900/50">
                                    <td className="px-4 py-3 text-sm font-medium text-slate-200">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? "bg-yellow-500/20 text-yellow-200" :
                                                    index === 1 ? "bg-slate-500/20 text-slate-300" :
                                                        index === 2 ? "bg-orange-500/20 text-orange-200" :
                                                            "bg-slate-600/20 text-slate-400"
                                                }`}>
                                                {index + 1}
                                            </div>
                                            {tech.technicianName}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">
                                        <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-200">
                                            {tech.assignedTickets}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">
                                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-200">
                                            {tech.resolvedTickets}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">
                                        <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs font-semibold text-yellow-200">
                                            {tech.inProgressTickets}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${efficiency >= 80 ? "bg-emerald-500" :
                                                            efficiency >= 60 ? "bg-yellow-500" :
                                                                efficiency >= 40 ? "bg-orange-500" :
                                                                    "bg-red-500"
                                                        }`}
                                                    style={{ width: `${efficiency}%` }}
                                                />
                                            </div>
                                            <span className={`text-sm font-semibold ${getEfficiencyColor(efficiency)}`}>
                                                {efficiency}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-300">
                                        {tech.avgResolutionTime ? (
                                            <span>
                                                {tech.avgResolutionTime} {tech.avgResolutionTime === 1 ? 'dia' : 'dias'}
                                            </span>
                                        ) : (
                                            <span className="italic text-slate-500">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}