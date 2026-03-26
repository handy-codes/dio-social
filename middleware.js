import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk middleware should only provide auth context; route protection is handled
// inside our API handlers (returning 401) so the Home page can still render.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
