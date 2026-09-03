import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, organization_name, created_at")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) return null;

  return { user, profile };
}

export async function requireRole(role: UserRole) {
  const current = await getCurrentProfile();

  if (!current) redirect("/login");

  if (current.profile.role !== role) {
    redirect(current.profile.role === "ngo" ? "/ngo/dashboard" : "/dashboard");
  }

  return current;
}
