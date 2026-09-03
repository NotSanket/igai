import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/session";

import { signup } from "../actions";
import { AuthForm } from "../auth-form";

export default async function SignupPage() {
  const current = await getCurrentProfile();
  if (current) {
    redirect(current.profile.role === "ngo" ? "/ngo/dashboard" : "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.24em] text-emerald-700 uppercase">
          IGAI
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Create your account</h1>
        <p className="mt-2 text-slate-600">Choose your role and organization to get started.</p>
        <AuthForm action={signup} mode="signup" />
      </section>
    </main>
  );
}
