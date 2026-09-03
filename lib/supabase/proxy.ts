import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnvironment } from "./env";

const corporateRoutes = [
  "/dashboard",
  "/proposals",
  "/optimizer",
  "/challenge",
  "/scenario-lab",
  "/impact-map",
];

const ngoRoutes = ["/ngo/dashboard", "/ngo/proposals"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnvironment();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const isCorporateRoute = corporateRoutes.some((route) =>
    matchesRoute(pathname, route),
  );
  const isNgoRoute = ngoRoutes.some((route) => matchesRoute(pathname, route));

  if (!isCorporateRoute && !isNgoRoute) {
    await supabase.auth.getUser();
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: "ngo" | "corporate" }>();

  if (!profile) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "Profile setup is incomplete.");
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  if (isCorporateRoute && profile.role !== "corporate") {
    const ngoUrl = request.nextUrl.clone();
    ngoUrl.pathname = "/ngo/dashboard";
    ngoUrl.search = "";
    return copyCookies(response, NextResponse.redirect(ngoUrl));
  }

  if (isNgoRoute && profile.role !== "ngo") {
    const corporateUrl = request.nextUrl.clone();
    corporateUrl.pathname = "/dashboard";
    corporateUrl.search = "";
    return copyCookies(response, NextResponse.redirect(corporateUrl));
  }

  return response;
}
