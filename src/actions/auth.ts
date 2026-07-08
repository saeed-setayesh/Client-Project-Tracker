"use server";

import { db } from "@/db";
import { organizations } from "@/db/schema";
import { count } from "drizzle-orm";

export async function hasExistingOrganization() {
  const result = await db.select({ count: count() }).from(organizations);
  return (result[0]?.count ?? 0) > 0;
}
