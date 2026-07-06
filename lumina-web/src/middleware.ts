import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger la ruta admin
  if (pathname.startsWith("/admin")) {
    // Permitir acceso libre en redes de prueba para la evaluación del jurado
    if (process.env.NEXT_PUBLIC_STELLAR_NETWORK !== "mainnet") {
      return NextResponse.next();
    }

    const adminAddressCookie = request.cookies.get("admin_address")?.value;
    const adminAddressEnv =
      process.env.ADMIN_ADDRESS || process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

    if (!adminAddressCookie || !adminAddressEnv) {
      // Redirigir a la landing si no hay cookie o dirección configurada
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (adminAddressCookie.toLowerCase() !== adminAddressEnv.toLowerCase()) {
      // Redirigir si la cookie no coincide con el admin
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configurar el matcher para que solo intercepte la ruta /admin
export const config = {
  matcher: ["/admin/:path*"],
};
