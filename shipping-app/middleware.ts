import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Definimos qué páginas web son públicas (tu Home)
const isPublicRoute = createRouteMatcher([
  "/"
]);

// 2. Identificamos TODAS las APIs de envíos
const isApiRoute = createRouteMatcher([
  "/api/shippings(.*)"
]);

// 3. Identificamos la ÚNICA API que debe ser pública (el rastreo)
const isTrackingApi = createRouteMatcher([
  "/api/shippings/track(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  
  // LOGICA PARA LAS APIs:
  // Si es una API de envíos, Y NO es la de rastreo... pedimos clave
  if (isApiRoute(request) && !isTrackingApi(request)) {
    const apiKey = request.headers.get("x-api-key");
    const { userId } = await auth(); 

    // Si no tiene la API KEY y tampoco es un operador logueado, lo rebotamos
    if (apiKey !== process.env.SHIPPING_API_KEY && !userId) {
      return NextResponse.json(
        { error: "Acceso denegado. Faltan credenciales de seguridad." },
        { status: 401 }
      );
    }
  }

  // LOGICA PARA LAS PÁGINAS (Frontend):
if (!isPublicRoute(request) && !isApiRoute(request)) {
await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|webp|text|json|woff2?|ico)$).*)",
    "/(api|trpc)(.*)",
  ],
};