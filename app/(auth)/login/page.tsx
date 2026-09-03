import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/session";

import { login } from "../actions";
import { AuthForm } from "../auth-form";

interface LoginPageProps {
  searchParams: Promise<{ message?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const current = await getCurrentProfile();
  if (current) {
    redirect(current.profile.role === "ngo" ? "/ngo/dashboard" : "/dashboard");
  }

  const { message, error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.24em] text-emerald-700 uppercase">
          IGAI
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Welcome back</h1>
        <p className="mt-2 text-slate-600">Sign in to continue to your workspace.</p>
        {message ? (
          <p className="mt-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <AuthForm action={login} mode="login" />
      </section>
    </main>
  );
}
