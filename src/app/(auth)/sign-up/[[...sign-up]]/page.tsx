import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
    title: "Criar conta · CRTE Chamados",
};

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg">
                <SignUp
                    path="/sign-up"
                    routing="path"
                    signInUrl="/sign-in"
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
