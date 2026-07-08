import { describe, it, expect } from "vitest";
import {
  isAdmin,
  isClient,
  canEditData,
  canAccessProject,
  canAccessClientsList,
} from "@/lib/permissions";

const admin = {
  id: "1",
  email: "a@test.com",
  name: "Admin",
  role: "admin" as const,
  orgId: "org1",
  clientId: null,
};

const teamMember = {
  id: "2",
  email: "t@test.com",
  name: "Team",
  role: "team_member" as const,
  orgId: "org1",
  clientId: null,
};

const clientUser = {
  id: "3",
  email: "c@test.com",
  name: "Client",
  role: "client" as const,
  orgId: "org1",
  clientId: "client1",
};

describe("permissions", () => {
  it("identifies admin role", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(teamMember)).toBe(false);
  });

  it("identifies client role", () => {
    expect(isClient(clientUser)).toBe(true);
    expect(isClient(admin)).toBe(false);
  });

  it("allows edit for admin and team", () => {
    expect(canEditData(admin)).toBe(true);
    expect(canEditData(teamMember)).toBe(true);
    expect(canEditData(clientUser)).toBe(false);
  });

  it("restricts client project access", () => {
    expect(
      canAccessProject(clientUser, { orgId: "org1", clientId: "client1" }),
    ).toBe(true);
    expect(
      canAccessProject(clientUser, { orgId: "org1", clientId: "client2" }),
    ).toBe(false);
  });

  it("hides clients list from client role", () => {
    expect(canAccessClientsList(admin)).toBe(true);
    expect(canAccessClientsList(clientUser)).toBe(false);
  });
});
