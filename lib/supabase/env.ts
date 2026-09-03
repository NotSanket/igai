const requiredEnvironmentVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function getSupabaseEnvironment() {
  const values = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };

  const missing = requiredEnvironmentVariables.filter(
    (name) => !process.env[name],
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    url: values.url as string,
    publishableKey: values.publishableKey as string,
  };
}
