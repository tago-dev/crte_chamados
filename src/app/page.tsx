"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              CRTE · Núcleo de Educação AMS
            </p>
            <h1 className="text-lg font-semibold">Central de Chamados</h1>
          </div>
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link
                href="/solicitacao"
                className="rounded-md border border-emerald-400/50 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Área autenticada
              </Link>
              <UserButton appearance={{ variables: { colorPrimary: "#10b981" } }} />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton fallbackRedirectUrl="/solicitacao" mode="modal">
                <button className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-emerald-400 hover:text-emerald-200">
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl="/solicitacao" mode="modal">
                <button className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  Criar conta
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-16">
        <section className="rounded-xl border border-white/10 bg-slate-900 p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-emerald-200">
            Atendimento pedagógico e tecnológico sob controle
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Cadastre, acompanhe e resolva chamados de suporte do Coordenação Regional
            de Tecnologias Educacionais (CRTE) do Núcleo de Educação AMS com
            autenticação segura via Clerk e dados centralizados no Supabase.
          </p>
          <SignedOut>
            <div className="mt-8 flex flex-wrap gap-4">
              <SignUpButton fallbackRedirectUrl="/solicitacao" mode="modal">
                <button className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  Começar agora
                </button>
              </SignUpButton>
              <SignInButton fallbackRedirectUrl="/solicitacao" mode="modal">
                <button className="rounded-md border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-emerald-400 hover:text-emerald-200">
                  Já tenho acesso
                </button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="mt-8">
              <Link
                href="/solicitacao"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Abrir área autenticada
              </Link>
            </div>
          </SignedIn>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-slate-900 p-6">
            <h3 className="font-semibold text-emerald-200">Autenticação moderna</h3>
            <p className="mt-2 text-sm text-slate-300">
              Use o Clerk para login seguro com e-mail, senha forte e recuperação
              automática sem lidar com senhas no backend.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900 p-6">
            <h3 className="font-semibold text-emerald-200">Dados centralizados</h3>
            <p className="mt-2 text-sm text-slate-300">
              Todos os chamados são persistidos no Supabase com auditoria e
              políticas de acesso para a equipe do CRTE.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900 p-6">
            <h3 className="font-semibold text-emerald-200">Fluxo educacional</h3>
            <p className="mt-2 text-sm text-slate-300">
              Organize atendimentos pedagógicos, técnicos e logísticos em um só
              lugar, com visão focada no Núcleo AMS.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 text-xs text-slate-500">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span>© {new Date().getFullYear()} CRTE · Núcleo de Educação AMS</span>
          <span>Desenvolvido em Next.js, Clerk e Supabase</span>
        </div>
      </footer>
    </div>
  );
}
