"use server";

import { db } from "@/db";
import { organizations, users } from "@/db/schema";
import { count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData): Promise<void> {
  const orgCount = await db.select({ count: count() }).from(organizations);
  if ((orgCount[0]?.count ?? 0) > 0) {
    throw new Error("Signup is disabled. Ask your admin for an invite.");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const orgName = formData.get("orgName") as string;

  if (!name || !email || !password || !orgName) {
    throw new Error("All fields are required.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [org] = await db
    .insert(organizations)
    .values({ name: orgName, slug: slugify(orgName) })
    .returning();

  await db.insert(users).values({
    orgId: org.id,
    email,
    passwordHash,
    name,
    role: "admin",
    hourlyRate: "100.00",
  });

  redirect("/login?registered=true");
}
