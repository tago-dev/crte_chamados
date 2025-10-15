"use client";

import { useState } from "react";
import { TicketType } from "@/lib/supabase/tickets";

type TicketTypeSelectorProps = {
    onTypeChange: (type: TicketType) => void;
    selectedType: TicketType | null;
};

export function TicketTypeSelector({ onTypeChange, selectedType }: TicketTypeSelectorProps) {
    return (
        <div className="grid gap-4">
            <h3 className="text-sm font-medium text-slate-200">Tipo de solicitação</h3>
            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => onTypeChange("pedagogico")}
                    className={`group rounded-lg border-2 p-4 text-left transition-all ${selectedType === "pedagogico"
                            ? "border-emerald-400 bg-emerald-500/10"
                            : "border-white/10 bg-slate-900 hover:border-emerald-400/50"
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 h-4 w-4 rounded-full border-2 transition-colors ${selectedType === "pedagogico"
                                ? "border-emerald-400 bg-emerald-400"
                                : "border-white/30 group-hover:border-emerald-400/50"
                            }`}>
                            {selectedType === "pedagogico" && (
                                <div className="h-full w-full rounded-full bg-white scale-50"></div>
                            )}
                        </div>
                        <div>
                            <h4 className={`font-semibold ${selectedType === "pedagogico" ? "text-emerald-200" : "text-slate-200"
                                }`}>
                                📚 Pedagógico
                            </h4>
                            <p className="mt-1 text-sm text-slate-400">
                                Solicitações relacionadas a questões educacionais, curriculares e pedagógicas
                            </p>
                            <div className="mt-2 text-xs text-slate-500">
                                Requer: CPF, RG e descrição
                            </div>
                        </div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onTypeChange("tecnico")}
                    className={`group rounded-lg border-2 p-4 text-left transition-all ${selectedType === "tecnico"
                            ? "border-blue-400 bg-blue-500/10"
                            : "border-white/10 bg-slate-900 hover:border-blue-400/50"
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`mt-1 h-4 w-4 rounded-full border-2 transition-colors ${selectedType === "tecnico"
                                ? "border-blue-400 bg-blue-400"
                                : "border-white/30 group-hover:border-blue-400/50"
                            }`}>
                            {selectedType === "tecnico" && (
                                <div className="h-full w-full rounded-full bg-white scale-50"></div>
                            )}
                        </div>
                        <div>
                            <h4 className={`font-semibold ${selectedType === "tecnico" ? "text-blue-200" : "text-slate-200"
                                }`}>
                                💻 Técnico
                            </h4>
                            <p className="mt-1 text-sm text-slate-400">
                                Problemas de hardware, software, rede e infraestrutura tecnológica
                            </p>
                            <div className="mt-2 text-xs text-slate-500">
                                Requer: IP da máquina e descrição
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}