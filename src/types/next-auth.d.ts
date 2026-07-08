import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      orgId: string;
      clientId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    orgId: string;
    clientId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    orgId: string;
    clientId: string | null;
  }
}
