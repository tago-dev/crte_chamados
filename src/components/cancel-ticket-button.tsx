"use client";

import { useState } from "react";

type CancelTicketButtonProps = {
    ticketId: string;
    ticketNumber: number;
    onCancel: (ticketId: string) => Promise<void>;
    disabled?: boolean;
};

export function CancelTicketButton({
    ticketId,
    ticketNumber,
    onCancel,
    disabled = false,
}: CancelTicketButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        const confirmed = window.confirm(
            `Tem certeza que deseja cancelar o chamado #${ticketNumber}?\n\n` +
            `Esta ação enviará um email de notificação para o usuário e não pode ser desfeita.`
        );

        if (!confirmed) return;

        setIsLoading(true);
        try {
            await onCancel(ticketId);
        } catch (error) {
            console.error("Erro ao cancelar chamado:", error);
            alert("Erro ao cancelar chamado. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isLoading}
            className="rounded-md bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? "Cancelando..." : "Cancelar chamado"}
        </button>
    );
}