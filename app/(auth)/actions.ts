"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export interface AuthState {
  error: string | null;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function login(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: error?.message ?? "Unable to sign in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single<{ role: UserRole }>();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Your account profile is not ready. Please contact support." };
  }

  redirect(profile.role === "ngo" ? "/ngo/dashboard" : "/dashboard");
}

export async function signup(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const fullName = text(formData, "fullName");
  const organizationName = text(formData, "organizationName");
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");
  const role = text(formData, "role") as UserRole;

  if (!fullName || !organizationName || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (role !== "ngo" && role !== "corporate") {
    return { error: "Choose a valid role." };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        organization_name: organizationName,
        role,
      },
      ...(origin ? { emailRedirectTo: `${origin}/auth/callback` } : {}),
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Unable to create your account." };
  }

  if (!data.session) {
    redirect("/login?message=Check+your+email+to+confirm+your+account.");
  }

  redirect(role === "ngo" ? "/ngo/dashboard" : "/dashboard");
}
