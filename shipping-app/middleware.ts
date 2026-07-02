import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/"
]);

const isApiRoute = createRouteMatcher([
  "/api/shippings(.*)"
]);

const isTrackingApi = createRouteMatcher([
  "/api/shippings/track(.*)"
]);

const isEstimateApi = createRouteMatcher([
  "/api/shippings/estimate(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. EXCEPCIÓN PARA ESTIMATE:
  // Si la petición va a /estimate, la dejamos pasar de largo. 
  // Su propio archivo route.ts ya se encarga de validar la BUYER_API_KEY.
  if (isEstimateApi(request)) {
    return NextResponse.next();
  }

  // Lógica original para el resto de tus rutas
  if (isApiRoute(request) && !isTrackingApi(request)) {
    const apiKey = request.headers.get("x-api-key");
    const { userId } = await auth(); 
    if (apiKey !== process.env.SHIPPING_API_KEY && !userId) {
      return NextResponse.json(
        { error: "Acceso denegado. Faltan credenciales de seguridad." },
        { status: 401 }
      );
    }
  }

  // Agregamos !isEstimateApi acá para que Clerk no le pida iniciar sesión
  if (!isPublicRoute(request) && !isApiRoute(request) && !isEstimateApi(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|webp|text|json|woff2?|ico)$).*)",
    "/(api|trpc)(.*)",
  ],
};