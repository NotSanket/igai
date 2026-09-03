import { logout } from "@/app/actions/auth";
import type { Profile } from "@/types/database";

interface DashboardShellProps {
  profile: Profile;
  title: string;
  description: string;
}

export function DashboardShell({ profile, title, description }: DashboardShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-12">
      <header className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <p className="text-sm font-semibold tracking-[0.24em] text-emerald-700 uppercase">
            IGAI
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
        </div>
        <form action={logout}>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Log out
          </button>
        </form>
      </header>
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">
          Hello, {profile.full_name ?? profile.email ?? "there"}
        </h2>
        <p className="mt-3 text-slate-600">{description}</p>
        {profile.organization_name ? (
          <p className="mt-6 text-sm font-medium text-slate-500">
            Organization: {profile.organization_name}
          </p>
        ) : null}
      </section>
    </main>
  );
}
