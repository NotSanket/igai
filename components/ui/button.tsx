import * as React from "react";

import { cn } from "@/lib/utils";

export function Button({ className, type = "button", ...props }: React.ComponentProps<"button">) {
  return <button type={type} className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:cursor-wait disabled:opacity-70", className)} {...props} />;
}
