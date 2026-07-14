import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Route protection + session refresh (spec §3: zaštita ruta po roli).
const MANAGER_PREFIXES = ["/panel"]; // izvođač/menadžer panel
// Pretraga i profili su javni (marketplace discovery); samo lični prostor je zaštićen.
const ORGANIZER_PREFIXES = ["/moji-upiti"]; // naručilac
const AUTH_ROUTES = ["/prijava", "/registracija"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsManager = MANAGER_PREFIXES.some((p) => path.startsWith(p));
  const needsOrganizer = ORGANIZER_PREFIXES.some((p) => path.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => path.startsWith(p));

  // Not logged in and hitting a protected area -> to login.
  if (!user && (needsManager || needsOrganizer)) {
    const url = request.nextUrl.clone();
    url.pathname = "/prijava";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && (needsManager || needsOrganizer || isAuthRoute)) {
    const role = (user.user_metadata?.role as string | undefined) ?? null;
    const isOrganizer = role === "ORGANIZER";

    // Already logged in -> keep away from auth pages, send to their home.
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = isOrganizer ? "/pretraga" : "/panel";
      return NextResponse.redirect(url);
    }

    // Role mismatch -> bounce to their own area.
    if (needsManager && isOrganizer) {
      const url = request.nextUrl.clone();
      url.pathname = "/pretraga";
      return NextResponse.redirect(url);
    }
    if (needsOrganizer && !isOrganizer) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
