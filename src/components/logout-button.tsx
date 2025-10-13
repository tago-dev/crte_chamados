"use client";

import { SignOutButton } from "@clerk/nextjs";

export function LogoutButton() {
    return (
        <SignOutButton redirectUrl="/">
            <button className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 hover:border-red-500/50">
                Sair
            </button>
        </SignOutButton>
    );
}