import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function ProposalNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7f6] p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,.08)]">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><FileQuestion className="size-5" /></span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">Proposal not found</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">This link is invalid, or the proposal belongs to another organisation.</p>
        <Link href="/ngo/proposals" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800">Back to my proposals</Link>
      </div>
    </main>
  );
}
