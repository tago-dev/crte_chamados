"use client";

import { useState } from "react";

type AssignTicketButtonProps = {
    ticketId: string;
    onAssign: (ticketId: string) => Promise<void>;
    disabled?: boolean;
};

export function AssignTicketButton({ ticketId, onAssign, disabled = false }: AssignTicketButtonProps) {
    const [isAssigning, setIsAssigning] = useState(false);

    const handleAssign = async () => {
        try {
            setIsAssigning(true);
            await onAssign(ticketId);
        } catch (error) {
            console.error('Erro ao atribuir chamado:', error);
            // Aqui você poderia mostrar uma notificação de erro
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <button
            onClick={handleAssign}
            disabled={disabled || isAssigning}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${disabled || isAssigning
                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                }`}
        >
            {isAssigning ? "Atribuindo..." : "Atribuir para mim"}
        </button>
    );
}