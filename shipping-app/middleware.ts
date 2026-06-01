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

export default clerkMiddleware(async (auth, request) => {
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