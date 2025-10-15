"use client";

import { useState } from "react";

type IPInputProps = {
    name: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
};

export function IPInput({ name, placeholder = "192.168.1.1", className, required }: IPInputProps) {
    const [value, setValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;

        // Remove tudo que não seja número ou ponto
        const cleaned = input.replace(/[^0-9.]/g, "");

        // Limita a 4 grupos de até 3 dígitos cada
        const parts = cleaned.split(".");
        if (parts.length <= 4) {
            const limitedParts = parts.map(part => part.slice(0, 3));
            setValue(limitedParts.join("."));
        }
    };

    const validateIP = (ip: string): boolean => {
        const parts = ip.split(".");
        if (parts.length !== 4) return false;

        return parts.every(part => {
            const num = parseInt(part, 10);
            return !isNaN(num) && num >= 0 && num <= 255;
        });
    };

    const isValid = !value || validateIP(value);

    return (
        <div className="relative">
            <input
                type="text"
                name={name}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                className={`${className} ${!isValid ? "border-red-500 focus:border-red-400" : ""}`}
                maxLength={15} // 192.168.100.100 = 15 caracteres máximo
            />
            {!isValid && value && (
                <p className="mt-1 text-xs text-red-400">
                    Formato de IP inválido (ex: 192.168.1.1)
                </p>
            )}
        </div>
    );
}