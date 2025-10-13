"use client";

import { useState } from "react";
import { TicketRecord } from "@/lib/supabase/tickets";
import { AssignTicketButton } from "./assign-ticket-button";

type TicketsTableProps = {
    tickets: TicketRecord[];
    onEditTicket: (ticket: TicketRecord) => void;
    onAssignTicket: (ticketId: string) => Promise<void>;
    currentUserName: string;
};

export function TicketsTable({ tickets, onEditTicket, onAssignTicket, currentUserName }: TicketsTableProps) {
    const [sortField, setSortField] = useState<keyof TicketRecord>("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSort = (field: keyof TicketRecord) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Filter tickets based on search term
    const filteredTickets = tickets.filter(ticket =>
        ticket.ticket_number.toString().includes(searchTerm) ||
        ticket.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.tecnico_responsavel?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedTickets = [...filteredTickets].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortDirection === "asc" ? -1 : 1;
        if (bValue === null) return sortDirection === "asc" ? 1 : -1;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "cancelado":
                return "bg-red-500/20 text-red-200";
            case "resolvido":
                return "bg-emerald-500/20 text-emerald-200";
            case "em_atendimento":
                return "bg-yellow-500/20 text-yellow-200";
            case "aguardando_os":
                return "bg-purple-500/20 text-purple-200";
            default:
                return "bg-slate-500/20 text-slate-200";
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            "aberto": "Aberto",
            "em_atendimento": "Em atendimento",
            "aguardando_os": "Aguardando OS",
            "resolvido": "Resolvido",
            "cancelado": "Cancelado"
        };
        return statusMap[status] || status;
    };

    if (tickets.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
                Nenhum chamado encontrado.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar por número, setor, solicitante, técnico ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                    />
                </div>
                <div className="text-sm text-slate-400">
                    Mostrando {sortedTickets.length} de {tickets.length} chamado(s)
                </div>
            </div>

            {sortedTickets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/70 p-8 text-center text-sm text-slate-400">
                    Nenhum chamado encontrado com os critérios de busca.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full rounded-lg border border-white/10 bg-slate-900">
                        <thead className="border-b border-white/10 bg-slate-900/50">
                            <tr>
                                <th
                                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                    onClick={() => handleSort("ticket_number")}
                                >
                                    #
                                    {sortField === "ticket_number" && (
                                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                    onClick={() => handleSort("setor")}
                                >
                                    Setor
                                    {sortField === "setor" && (
                                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                    Solicitante
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                    Técnico
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                    onClick={() => handleSort("status")}
                                >
                                    Status
                                    {sortField === "status" && (
                                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </th>
                                <th
                                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:text-emerald-200"
                                    onClick={() => handleSort("created_at")}
                                >
                                    Criado em
                                    {sortField === "created_at" && (
                                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                                    )}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {sortedTickets.map((ticket) => {
                                const isAssignedToCurrentUser = ticket.tecnico_responsavel === currentUserName;
                                const canBeAssigned = !ticket.tecnico_responsavel &&
                                    ticket.status !== "cancelado" &&
                                    ticket.status !== "resolvido";

                                return (
                                    <tr
                                        key={ticket.id}
                                        className={`hover:bg-slate-900/50 ${isAssignedToCurrentUser ? 'bg-blue-500/5 border-l-2 border-blue-500/30' : ''
                                            }`}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-slate-200">
                                            #{ticket.ticket_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-300">
                                            {ticket.setor}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-300">
                                            {ticket.solicitante}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-300">
                                            {ticket.tecnico_responsavel || (
                                                <span className="italic text-slate-500">Não atribuído</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400">
                                            {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onEditTicket(ticket)}
                                                    className="rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                                                >
                                                    Editar
                                                </button>
                                                {canBeAssigned && (
                                                    <AssignTicketButton
                                                        ticketId={ticket.id}
                                                        onAssign={onAssignTicket}
                                                    />
                                                )}
                                                {isAssignedToCurrentUser && ticket.status === "em_atendimento" && (
                                                    <span className="rounded-md bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-200">
                                                        Atribuído a você
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}