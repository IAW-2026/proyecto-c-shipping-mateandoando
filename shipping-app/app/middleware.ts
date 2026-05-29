import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",                 
  "/api/shippings(.*)" // Mantiene las apis libres para que las puedan acceder thunderclient para las pruebas y mis compañeros 
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect(); 
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|webp|text|json|woff2?|ico)$).*)",
    "/(api|trpc)(.*)",
  ],
};