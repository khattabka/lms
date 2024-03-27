import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ['/', '/sign-in', '/sign-up', '/api/uploadthing'],
  ignoredRoutes: ['/api/uploadthing)'],
});
 
export const config = {

  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};