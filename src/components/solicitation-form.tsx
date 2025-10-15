"use client";

import { useState } from "react";
import { TicketType } from "@/lib/supabase/tickets";
import { TicketTypeSelector } from "./ticket-type-selector";
import { CPFInput } from "./cpf-input";
import { IPInput } from "./ip-input";

const SECTORS = [
    "CHEFIA",
    "EDIFICAÇÕES",
    "RECURSOS HUMANOS",
    "NAS PONTUAL",
    "NAS PATRIMÔNIO",
    "TUTORIA",
    "FINANCEIRO",
    "EDUCAÇÃO PROFISSIONAL",
    "NCPM",
    "EJA",
    "ESTRUTURA",
    "CPADS",
    "RH",
    "PEDAGÓGICO",
    "REDS",
    "SERE",
    "PROTOCOLO",
    "OUVIDORIA",
    "FORMADORES",
    "EDUCAÇÃO ESPECIAL",
] as const;

type SolicitationFormProps = {
    onSubmit: (formData: FormData) => Promise<void>;
    success?: boolean;
    today: string;
};

export function SolicitationForm({ onSubmit, success, today }: SolicitationFormProps) {
    const [selectedType, setSelectedType] = useState<TicketType | null>(null);

    const handleSubmit = async (formData: FormData) => {
        if (selectedType) {
            formData.append("tipo", selectedType);
        }
        await onSubmit(formData);
    };

    return (
        <section className="rounded-xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-emerald-200">Novo chamado</h2>
                    <p className="text-sm text-slate-400">
                        Preencha os campos abaixo para abrir um chamado junto ao CRTE.
                    </p>
                </div>
                {success ? (
                    <span className="rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                        Chamado registrado com sucesso!
                    </span>
                ) : null}
            </div>

            <form action={handleSubmit} className="mt-6 grid gap-6">
                {/* Seleção do tipo de solicitação */}
                <TicketTypeSelector
                    onTypeChange={setSelectedType}
                    selectedType={selectedType}
                />

                {selectedType && (
                    <>
                        <input type="hidden" name="tipo" value={selectedType} />

                        {/* Campos comuns */}
                        <label className="grid gap-2 text-sm">
                            <span>Título do chamado</span>
                            <input
                                name="titulo"
                                type="text"
                                placeholder="Digite um título para o chamado"
                                required
                                className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </label>

                        <label className="grid gap-2 text-sm">
                            <span>Setor</span>
                            <select
                                name="setor"
                                required
                                className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none"
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Selecione um setor
                                </option>
                                {SECTORS.map((sector) => (
                                    <option key={sector} value={sector}>
                                        {sector}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Campos específicos por tipo */}
                        {selectedType === "pedagogico" && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="grid gap-2 text-sm">
                                    <span>CPF do solicitante</span>
                                    <CPFInput
                                        name="cpf"
                                        placeholder="000.000.000-00"
                                        required
                                        className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                                    />
                                </label>

                                <label className="grid gap-2 text-sm">
                                    <span>RG do solicitante</span>
                                    <input
                                        name="rg"
                                        type="text"
                                        placeholder="Digite o RG"
                                        required
                                        className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                                    />
                                </label>
                            </div>
                        )}

                        {selectedType === "tecnico" && (
                            <label className="grid gap-2 text-sm">
                                <span>IP da máquina</span>
                                <IPInput
                                    name="ip_maquina"
                                    placeholder="192.168.1.1"
                                    required
                                    className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                                />
                            </label>
                        )}

                        <label className="grid gap-2 text-sm">
                            <span>Descrição</span>
                            <textarea
                                name="description"
                                placeholder="Detalhe a solicitação"
                                rows={4}
                                required
                                className="rounded-md border border-white/10 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="grid gap-2 text-sm">
                                <span>Data de abertura</span>
                                <input
                                    value={today}
                                    readOnly
                                    className="rounded-md border border-dashed border-white/10 bg-slate-900 px-4 py-2 text-slate-400"
                                />
                            </label>
                            <label className="grid gap-2 text-sm">
                                <span>Nº do chamado</span>
                                <input
                                    value="Gerado automaticamente"
                                    readOnly
                                    className="rounded-md border border-dashed border-white/10 bg-slate-900 px-4 py-2 text-slate-400"
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 sm:w-auto"
                        >
                            Enviar chamado
                        </button>
                    </>
                )}

                {!selectedType && (
                    <div className="rounded-lg border border-dashed border-white/10 bg-slate-900/50 p-8 text-center">
                        <p className="text-slate-400">
                            Selecione o tipo de solicitação acima para continuar
                        </p>
                    </div>
                )}
            </form>
        </section>
    );
}