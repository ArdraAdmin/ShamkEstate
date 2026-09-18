import type { AppUser, FieldPermission, ModuleAccess } from "./types";

const allModules: ModuleAccess = {
  properties: true,
  assets: true,
  leases: true,
  financials: true,
  userManagement: true,
  reports: true,
};

function perms(
  rows: Array<[FieldPermission["module"], string, boolean, boolean]>
): FieldPermission[] {
  return rows.map(([module, resource, view, edit]) => ({
    module,
    resource,
    view,
    edit,
  }));
}

export const users: AppUser[] = [
  {
    id: "u-admin",
    name: "Anika Shah",
    email: "admin@estate.com",
    role: "Super Admin",
    status: "Active",
    lastActive: "2026-09-12 09:14",
    avatarInitials: "AS",
    scope: { companyIds: [] },
    modules: allModules,
    permissions: perms([
      ["properties", "Property profile", true, true],
      ["properties", "Ownership shares", true, true],
      ["properties", "Documents", true, true],
      ["leases", "Lease terms", true, true],
      ["leases", "Rent amount", true, true],
      ["leases", "Ownership shares", true, true],
      ["leases", "Documents", true, true],
      ["financials", "P&L", true, true],
      ["assets", "Asset records", true, true],
      ["userManagement", "Users & roles", true, true],
      ["reports", "All reports", true, true],
    ]),
  },
  {
    id: "u-lav",
    name: "Lav Mahtani",
    email: "lav@mahtani.family",
    role: "Owner/Family",
    status: "Active",
    lastActive: "2026-09-11 21:02",
    avatarInitials: "LM",
    scope: { companyIds: [] },
    modules: allModules,
    permissions: perms([
      ["properties", "Property profile", true, true],
      ["properties", "Ownership shares", true, true],
      ["leases", "Rent amount", true, true],
      ["financials", "P&L", true, true],
      ["userManagement", "Users & roles", true, true],
      ["reports", "All reports", true, true],
    ]),
  },
  {
    id: "u-accounts",
    name: "Priya Mehta",
    email: "priya.accounts@estate.com",
    role: "Accounts",
    status: "Active",
    lastActive: "2026-09-12 08:41",
    avatarInitials: "PM",
    scope: { companyIds: ["c-sm"] },
    modules: {
      properties: true,
      assets: false,
      leases: true,
      financials: true,
      userManagement: false,
      reports: true,
    },
    permissions: perms([
      ["properties", "Property profile", true, false],
      ["properties", "Ownership shares", true, false],
      ["properties", "Documents", false, false],
      ["leases", "Lease terms", true, false],
      ["leases", "Rent amount", true, true],
      ["leases", "Ownership shares", true, false],
      ["leases", "Documents", false, false],
      ["financials", "P&L", true, true],
      ["reports", "All reports", true, false],
    ]),
  },
  {
    id: "u-legal",
    name: "Rahul Khanna",
    email: "rahul.legal@estate.com",
    role: "Legal",
    status: "Active",
    lastActive: "2026-09-11 16:20",
    avatarInitials: "RK",
    scope: { companyIds: ["c-sm", "c-shr", "c-mh"] },
    modules: {
      properties: true,
      assets: false,
      leases: true,
      financials: false,
      userManagement: false,
      reports: false,
    },
    permissions: perms([
      ["properties", "Property profile", true, false],
      ["properties", "Ownership shares", false, false],
      ["properties", "Documents", true, true],
      ["leases", "Lease terms", true, true],
      ["leases", "Rent amount", false, false],
      ["leases", "Ownership shares", false, false],
      ["leases", "Documents", true, true],
    ]),
  },
  {
    id: "u-pm",
    name: "Neha Kulkarni",
    email: "neha.pm@estate.com",
    role: "Property Manager",
    status: "Active",
    lastActive: "2026-09-12 07:55",
    avatarInitials: "NK",
    scope: { companyIds: ["c-shr", "c-he"] },
    modules: {
      properties: true,
      assets: true,
      leases: true,
      financials: false,
      userManagement: false,
      reports: true,
    },
    permissions: perms([
      ["properties", "Property profile", true, true],
      ["properties", "Documents", true, true],
      ["assets", "Asset records", true, true],
      ["leases", "Lease terms", true, true],
      ["leases", "Rent amount", true, false],
      ["reports", "All reports", true, false],
    ]),
  },
  {
    id: "u-maint",
    name: "Imran Qureshi",
    email: "imran.maint@estate.com",
    role: "Maintenance",
    status: "Active",
    lastActive: "2026-09-10 19:12",
    avatarInitials: "IQ",
    scope: { companyIds: ["c-sm", "c-ar"] },
    modules: {
      properties: true,
      assets: true,
      leases: false,
      financials: false,
      userManagement: false,
      reports: false,
    },
    permissions: perms([
      ["properties", "Property profile", true, false],
      ["assets", "Asset records", true, true],
      ["assets", "AMC contracts", true, true],
    ]),
  },
  {
    id: "u-broker",
    name: "Sana Merchant",
    email: "sana.broker@estate.com",
    role: "Broker",
    status: "Active",
    lastActive: "2026-09-11 12:08",
    avatarInitials: "SM",
    scope: { companyIds: ["c-mh", "c-sm"] },
    modules: {
      properties: true,
      assets: false,
      leases: true,
      financials: false,
      userManagement: false,
      reports: false,
    },
    permissions: perms([
      ["properties", "Property profile", true, false],
      ["leases", "Lease terms", true, false],
      ["leases", "Rent amount", true, false],
      ["leases", "Documents", false, false],
    ]),
  },
  {
    id: "u-vendor",
    name: "CoolAir Desk",
    email: "desk@coolair.services",
    role: "Vendor",
    status: "Inactive",
    lastActive: "2026-07-02 10:00",
    avatarInitials: "CA",
    scope: { companyIds: ["c-sm"] },
    modules: {
      properties: false,
      assets: true,
      leases: false,
      financials: false,
      userManagement: false,
      reports: false,
    },
    permissions: perms([
      ["assets", "Asset records", true, false],
      ["assets", "AMC contracts", true, false],
    ]),
  },
];

export const permissionCatalog: Array<{
  module: FieldPermission["module"];
  label: string;
  resources: string[];
}> = [
  {
    module: "properties",
    label: "Properties",
    resources: ["Property profile", "Ownership shares", "Documents", "Financials / P&L"],
  },
  {
    module: "assets",
    label: "Assets",
    resources: ["Asset records", "AMC contracts", "Documents"],
  },
  {
    module: "leases",
    label: "Leases",
    resources: ["Lease terms", "Rent amount", "Ownership shares", "Documents", "Payments"],
  },
  {
    module: "financials",
    label: "Financials",
    resources: ["P&L", "Deposits", "Owner splits"],
  },
  {
    module: "userManagement",
    label: "User Management",
    resources: ["Users & roles", "Permission matrix"],
  },
  {
    module: "reports",
    label: "Reports",
    resources: ["All reports", "Export"],
  },
];

export function getUser(id: string) {
  return users.find((u) => u.id === id);
}
