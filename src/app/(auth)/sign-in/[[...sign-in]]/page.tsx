import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
    title: "Entrar · CRTE Chamados",
};

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg">
                <SignIn
                    path="/sign-in"
                    routing="path"
                    signUpUrl="/sign-up"
                    appearance={{
                        elements: {
                            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
                        },
                        variables: {
                            colorPrimary: "#10b981",
                        },
                    }}
                    fallbackRedirectUrl="/solicitacao"
                />
            </div>
        </div>
    );
}
