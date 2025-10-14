"use client";

import { useState, useEffect } from "react";
import { TicketRecord, TicketStatus, ProfileRecord } from "@/lib/supabase/tickets";
import { CancelTicketButton } from "./cancel-ticket-button";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
    { value: "aberto", label: "Aberto" },
    { value: "em_atendimento", label: "Em atendimento" },
    { value: "aguardando_os", label: "Aguardando OS" },
    { value: "resolvido", label: "Resolvido" },
    { value: "cancelado", label: "Cancelado" },
];

type TicketModalProps = {
    ticket: TicketRecord | null;
    users: ProfileRecord[];
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (formData: FormData) => Promise<void>;
    onCancel: (ticketId: string) => Promise<void>;
};

export function TicketModal({ ticket, users, isOpen, onClose, onUpdate, onCancel }: TicketModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("aberto");

    // Atualiza o selectedStatus quando o ticket mudar
    useEffect(() => {
        if (ticket) {
            setSelectedStatus(ticket.status);
        }
    }, [ticket]);

    if (!isOpen || !ticket) return null;

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar chamado:", error);
            alert("Erro ao atualizar chamado. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (ticketId: string) => {
        try {
            await onCancel(ticketId);
            onClose();
        } catch (error) {
            console.error("Erro ao cancelar chamado:", error);
            alert("Erro ao cancelar chamado. Tente novamente.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-slate-900 p-6 shadow-xl">
                <header className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-emerald-200">
                            Editar Chamado #{ticket.ticket_number}
                        </h2>
                        <p className="text-sm text-slate-400">
                            Aberto em {new Date(ticket.created_at).toLocaleString("pt-BR")}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                <div className="mb-6 space-y-4">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Título
                        </label>
                        <p className="text-slate-100">{ticket.titulo || "Sem título"}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Setor
                            </label>
                            <p className="text-slate-100">{ticket.setor}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Solicitante
                            </label>
                            <p className="text-slate-100">{ticket.solicitante}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                CPF
                            </label>
                            <p className="text-slate-100">
                                {ticket.cpf ?
                                    ticket.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') :
                                    <span className="italic text-slate-500">Não informado</span>
                                }
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                RG
                            </label>
                            <p className="text-slate-100">{ticket.rg || <span className="italic text-slate-500">Não informado</span>}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Descrição
                        </label>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                            {ticket.description}
                        </p>
                    </div>

                    {/* Exibir OS CELEPAR se existir */}
                    {ticket.os_celepar && (
                        <div className="rounded-md border border-purple-500/20 bg-purple-500/10 p-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200">
                                OS CELEPAR
                            </label>
                            <p className="mt-1 text-sm font-mono text-purple-100">{ticket.os_celepar}</p>
                        </div>
                    )}
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <input type="hidden" name="ticket_id" value={ticket.id} />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Status
                            </label>
                            <select
                                name="status"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Técnico responsável
                            </label>
                            <select
                                name="tecnico_responsavel"
                                defaultValue={ticket.tecnico_responsavel ?? ""}
                                disabled={selectedStatus === "aguardando_os"}
                                className={`mt-1 w-full rounded-md border border-white/10 px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none ${selectedStatus === "aguardando_os"
                                    ? "bg-slate-800 cursor-not-allowed opacity-60"
                                    : "bg-slate-950"
                                    }`}
                            >
                                <option value="">Selecione um técnico</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.full_name || user.email || user.id}>
                                        {user.full_name || user.email || user.id}
                                        {user.is_admin && " (Admin)"}
                                    </option>
                                ))}
                            </select>
                            {selectedStatus === "aguardando_os" && (
                                <p className="mt-1 text-xs text-slate-400">
                                    Campo bloqueado quando status é "Aguardando OS"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Campo OS CELEPAR - aparece quando status é "aguardando_os" */}
                    {selectedStatus === "aguardando_os" && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                OS CELEPAR
                            </label>
                            <input
                                name="os_celepar"
                                defaultValue={ticket.os_celepar ?? ""}
                                placeholder="Digite o número da OS da CELEPAR"
                                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                            >
                                {isLoading ? "Salvando..." : "Salvar alterações"}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                            >
                                Cancelar
                            </button>
                        </div>

                        {ticket.status !== "cancelado" && (
                            <CancelTicketButton
                                ticketId={ticket.id}
                                ticketNumber={ticket.ticket_number}
                                onCancel={handleCancel}
                            />
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}