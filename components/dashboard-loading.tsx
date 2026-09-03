import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading() {
  return <div className="min-h-screen bg-[#f5f7f6] p-6 lg:pl-[310px] lg:pt-28"><div className="mx-auto max-w-[1500px]"><Skeleton className="h-10 w-72" /><Skeleton className="mt-3 h-5 w-[420px] max-w-full" /><div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-48" />)}</div><div className="mt-6 grid gap-6 xl:grid-cols-3"><Skeleton className="h-96 xl:col-span-2" /><Skeleton className="h-96" /></div><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><Skeleton className="h-6 w-44" />{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="mt-5 h-10 w-full" />)}</div></div></div>;
}
