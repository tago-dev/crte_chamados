"use client";

import { useState, useEffect } from "react";

type CPFInputProps = {
    name: string;
    defaultValue?: string;
    placeholder?: string;
    className?: string;
};

export function CPFInput({ name, defaultValue = "", placeholder = "000.000.000-00", className }: CPFInputProps) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    const formatCPF = (cpf: string) => {
        // Remove tudo que não é dígito
        const numbers = cpf.replace(/\D/g, '');

        // Aplica a máscara
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }

        return numbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setValue(formatted);
    };

    return (
        <input
            name={name}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={14}
            className={className}
        />
    );
}