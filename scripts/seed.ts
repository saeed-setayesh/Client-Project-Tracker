import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  await db.delete(schema.comments);
  await db.delete(schema.timeEntries);
  await db.delete(schema.tasks);
  await db.delete(schema.projects);
  await db.delete(schema.invitations);
  await db.delete(schema.users);
  await db.delete(schema.clients);
  await db.delete(schema.organizations);

  const passwordHash = await bcrypt.hash("password123", 12);

  const [org] = await db
    .insert(schema.organizations)
    .values({ name: "Acme Digital Agency", slug: "acme-digital-agency" })
    .returning();

  const [admin] = await db
    .insert(schema.users)
    .values({
      orgId: org.id,
      email: "admin@acme.test",
      passwordHash,
      name: "Alex Admin",
      role: "admin",
      hourlyRate: "120.00",
    })
    .returning();

  const teamMembers = await db
    .insert(schema.users)
    .values([
      {
        orgId: org.id,
        email: "sarah@acme.test",
        passwordHash,
        name: "Sarah Designer",
        role: "team_member",
        hourlyRate: "85.00",
      },
      {
        orgId: org.id,
        email: "mike@acme.test",
        passwordHash,
        name: "Mike Developer",
        role: "team_member",
        hourlyRate: "95.00",
      },
      {
        orgId: org.id,
        email: "emma@acme.test",
        passwordHash,
        name: "Emma PM",
        role: "team_member",
        hourlyRate: "90.00",
      },
    ])
    .returning();

  const clientCompanies = await db
    .insert(schema.clients)
    .values([
      {
        orgId: org.id,
        companyName: "TechStart Inc",
        contactName: "John Smith",
        email: "john@techstart.com",
        phone: "+1 555-0101",
      },
      {
        orgId: org.id,
        companyName: "GreenLeaf Organics",
        contactName: "Maria Garcia",
        email: "maria@greenleaf.com",
        phone: "+1 555-0102",
      },
      {
        orgId: org.id,
        companyName: "Urban Fitness Co",
        contactName: "David Chen",
        email: "david@urbanfit.com",
        phone: "+1 555-0103",
      },
      {
        orgId: org.id,
        companyName: "Bloom Studios",
        contactName: "Lisa Park",
        email: "lisa@bloomstudios.com",
        phone: "+1 555-0104",
      },
    ])
    .returning();

  await db.insert(schema.users).values([
    {
      orgId: org.id,
      email: "john@techstart.com",
      passwordHash,
      name: "John Smith",
      role: "client",
      clientId: clientCompanies[0].id,
      hourlyRate: "0",
    },
    {
      orgId: org.id,
      email: "maria@greenleaf.com",
      passwordHash,
      name: "Maria Garcia",
      role: "client",
      clientId: clientCompanies[1].id,
      hourlyRate: "0",
    },
  ]);

  const statuses = ["planning", "active", "on_hold", "completed"] as const;
  const projectData = [];

  for (let i = 0; i < 8; i++) {
    projectData.push({
      orgId: org.id,
      clientId: clientCompanies[i % clientCompanies.length].id,
      name: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      status: statuses[i % statuses.length],
      budget: String(faker.number.int({ min: 5000, max: 50000 })),
      deadline: faker.date.future().toISOString().split("T")[0],
    });
  }

  const insertedProjects = await db.insert(schema.projects).values(projectData).returning();

  const taskStatuses = ["todo", "in_progress", "done"] as const;
  const allTasks = [];

  for (const project of insertedProjects) {
    const taskCount = faker.number.int({ min: 4, max: 7 });
    for (let i = 0; i < taskCount; i++) {
      allTasks.push({
        projectId: project.id,
        title: faker.hacker.phrase(),
        description: faker.lorem.sentence(),
        status: taskStatuses[i % taskStatuses.length],
        assigneeId: teamMembers[i % teamMembers.length].id,
        dueDate: faker.date.future().toISOString().split("T")[0],
        position: i,
      });
    }
  }

  const insertedTasks = await db.insert(schema.tasks).values(allTasks).returning();

  const timeEntryData = [];
  for (const task of insertedTasks.slice(0, 30)) {
    const entryCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < entryCount; j++) {
      const member = teamMembers[faker.number.int({ min: 0, max: 2 })];
      timeEntryData.push({
        taskId: task.id,
        userId: member.id,
        hours: String(faker.number.float({ min: 0.5, max: 8, fractionDigits: 1 })),
        date: faker.date.recent({ days: 30 }).toISOString().split("T")[0],
        billable: faker.datatype.boolean(0.8),
        note: faker.lorem.sentence(),
      });
    }
  }

  await db.insert(schema.timeEntries).values(timeEntryData);

  const commentData = [];
  for (const task of insertedTasks.slice(0, 20)) {
    const commentCount = faker.number.int({ min: 1, max: 2 });
    for (let j = 0; j < commentCount; j++) {
      const isInternal = faker.datatype.boolean();
      const author = isInternal
        ? teamMembers[faker.number.int({ min: 0, max: 2 })]
        : faker.datatype.boolean()
          ? teamMembers[0]
          : admin;

      commentData.push({
        taskId: task.id,
        userId: author.id,
        body: faker.lorem.paragraph(),
        isInternal,
      });
    }
  }

  await db.insert(schema.comments).values(commentData);

  console.log("✅ Seed complete!");
  console.log("");
  console.log("Login credentials:");
  console.log("  Admin:  admin@acme.test / password123");
  console.log("  Team:   sarah@acme.test / password123");
  console.log("  Client: john@techstart.com / password123");

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
