"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { TicketRecord } from "@/lib/supabase/tickets";

type ExportExcelButtonProps = {
    tickets: TicketRecord[];
    filteredTickets?: TicketRecord[];
    statusFilter?: string;
};

const STATUS_LABELS = {
    aberto: "Aberto",
    em_atendimento: "Em Atendimento",
    aguardando_os: "Aguardando OS",
    resolvido: "Resolvido",
    cancelado: "Cancelado"
};

export function ExportExcelButton({
    tickets,
    filteredTickets,
    statusFilter = "all"
}: ExportExcelButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const exportToExcel = async () => {
        setIsExporting(true);

        try {
            const ticketsToExport = filteredTickets || tickets;

            const data = ticketsToExport.map(ticket => ({
                "Número do Chamado": ticket.ticket_number,
                "Tipo": ticket.tipo === "pedagogico" ? "Pedagógico" : "Técnico",
                "Título": ticket.titulo || "Sem título",
                "Setor": ticket.setor,
                "Solicitante": ticket.solicitante,
                "CPF": ticket.cpf || "Não informado",
                "RG": ticket.rg || "Não informado",
                "IP da Máquina": ticket.ip_maquina || "Não informado",
                "Descrição": ticket.description,
                "Status": STATUS_LABELS[ticket.status] || ticket.status,
                "Técnico Responsável": ticket.tecnico_responsavel || "Não atribuído",
                "OS Celepar": ticket.os_celepar || "Não informado",
                "Data de Criação": new Date(ticket.created_at).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                })
            }));            // Cria a planilha
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();

            const sheetName = statusFilter === "all"
                ? "Todos os Chamados"
                : `Chamados - ${STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS] || statusFilter}`;

            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            // Ajusta a largura das colunas
            const columnWidths = [
                { wch: 15 }, // Número do Chamado
                { wch: 12 }, // Tipo
                { wch: 30 }, // Título
                { wch: 20 }, // Setor
                { wch: 25 }, // Solicitante
                { wch: 15 }, // CPF
                { wch: 15 }, // RG
                { wch: 15 }, // IP da Máquina
                { wch: 50 }, // Descrição
                { wch: 15 }, // Status
                { wch: 25 }, // Técnico Responsável
                { wch: 15 }, // OS Celepar
                { wch: 20 }  // Data de Criação
            ];
            worksheet["!cols"] = columnWidths;

            const currentDate = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
            const filterText = statusFilter === "all" ? "todos" : statusFilter.replace("_", "-");
            const fileName = `relatorio-chamados-${filterText}-${currentDate}.xlsx`;

            XLSX.writeFile(workbook, fileName);

        } catch (error) {
            console.error("Erro ao exportar relatório:", error);
            alert("Erro ao exportar relatório. Tente novamente.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={exportToExcel}
                disabled={isExporting || tickets.length === 0}
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600/20 to-blue-600/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition-all duration-300 hover:from-emerald-600/30 hover:to-blue-600/30 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {isExporting ? (
                    <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200/30 border-l-emerald-200"></div>
                        Exportando...
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <svg
                                className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400 opacity-0 group-hover:animate-ping group-hover:opacity-75"></div>
                        </div>
                        <span className="relative">
                            ✨ Exportar Excel
                            <span className="absolute inset-0 opacity-0 group-hover:animate-pulse group-hover:opacity-100">
                                ✨ Exportar Excel
                            </span>
                        </span>
                    </>
                )}
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 pointer-events-none">
                {tickets.length === 0
                    ? "Nenhum chamado para exportar"
                    : `Exportar ${(filteredTickets || tickets).length} chamado(s) em Excel`
                }
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
        </div>
    );
}
