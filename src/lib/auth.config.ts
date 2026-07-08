import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/db/schema";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/invite");

      if (!isLoggedIn && !isAuthPage) return false;
      if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      if (isLoggedIn && auth?.user) {
        const role = auth.user.role;

        if (
          role === "client" &&
          (pathname.startsWith("/clients") || pathname.startsWith("/settings"))
        ) {
          return Response.redirect(new URL("/", request.nextUrl));
        }

        if (pathname.startsWith("/settings") && role !== "admin") {
          return Response.redirect(new URL("/", request.nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.orgId = user.orgId;
        token.clientId = user.clientId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.orgId = token.orgId as string;
        session.user.clientId = token.clientId as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
