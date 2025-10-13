"use client";

import { useState } from "react";
import { TicketRecord, TicketStatus, ProfileRecord } from "@/lib/supabase/tickets";
import { TicketsTable } from "./tickets-table";
import { TicketModal } from "./ticket-modal";

type DashboardTicketsSectionProps = {
    tickets: TicketRecord[];
    users: ProfileRecord[];
    onUpdateTicket: (formData: FormData) => Promise<void>;
    onCancelTicket: (ticketId: string) => Promise<void>;
    onAssignTicket: (ticketId: string) => Promise<void>;
    currentUserName: string;
};

const STATUS_FILTERS = [
    { value: "all", label: "Todos", color: "bg-slate-500/20 text-slate-200" },
    { value: "aberto", label: "Abertos", color: "bg-blue-500/20 text-blue-200" },
    { value: "em_atendimento", label: "Em Atendimento", color: "bg-yellow-500/20 text-yellow-200" },
    { value: "aguardando_os", label: "Aguardando OS", color: "bg-purple-500/20 text-purple-200" },
    { value: "resolvido", label: "Resolvidos", color: "bg-emerald-500/20 text-emerald-200" },
    { value: "cancelado", label: "Cancelados", color: "bg-red-500/20 text-red-200" },
];

export function DashboardTicketsSection({
    tickets,
    users,
    onUpdateTicket,
    onCancelTicket,
    onAssignTicket,
    currentUserName
}: DashboardTicketsSectionProps) {
    const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const handleEditTicket = (ticket: TicketRecord) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };

    const filteredTickets = statusFilter === "all"
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter);

    const getStatusCount = (status: string) => {
        if (status === "all") return tickets.length;
        return tickets.filter(ticket => ticket.status === status).length;
    };

    return (
        <>
            <section className="grid gap-6">
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

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusFilter === filter.value
                                ? filter.color + " ring-2 ring-white/20"
                                : "bg-slate-700/50 text-slate-400 hover:" + filter.color
                                }`}
                        >
                            {filter.label}
                            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                                {getStatusCount(filter.value)}
                            </span>
                        </button>
                    ))}
                </div>

                <TicketsTable
                    tickets={filteredTickets}
                    onEditTicket={handleEditTicket}
                    onAssignTicket={onAssignTicket}
                    currentUserName={currentUserName}
                />
            </section>

            <TicketModal
                ticket={selectedTicket}
                users={users}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onUpdate={onUpdateTicket}
                onCancel={onCancelTicket}
            />
        </>
    );
}