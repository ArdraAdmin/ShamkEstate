import type { Company, Owner } from "./types";

export const companies: Company[] = [
  { id: "c-sm", name: "Shamak Mercantile", shortName: "Shamak", type: "company", code: "SM" },
  { id: "c-shr", name: "SHR Trading", shortName: "SHR", type: "company", code: "SHR" },
  { id: "c-mh", name: "Meridian Holdings", shortName: "Meridian", type: "company", code: "MH" },
  { id: "c-lmp", name: "Lav Mahtani (Personal)", shortName: "Personal", type: "personal", code: "LMP" },
  { id: "c-mft", name: "Mahtani Family Trust", shortName: "Trust", type: "trust", code: "MFT" },
  { id: "c-ar", name: "Ardra Realty LLP", shortName: "Ardra", type: "company", code: "AR" },
  { id: "c-cl", name: "Crestline Properties", shortName: "Crestline", type: "company", code: "CL" },
  { id: "c-he", name: "Horizon Estates", shortName: "Horizon", type: "company", code: "HE" },
  { id: "c-sv", name: "Silverline Ventures", shortName: "Silverline", type: "company", code: "SV" },
  { id: "c-nv", name: "Nirvaan Capital", shortName: "Nirvaan", type: "company", code: "NV" },
];

export const owners: Owner[] = [
  { id: "o-lav", name: "Lav Mahtani", relation: "Principal", email: "lav@mahtani.family", phone: "+91 98200 11001" },
  { id: "o-rhea", name: "Rhea Mahtani", relation: "Spouse", email: "rhea@mahtani.family", phone: "+91 98200 11002" },
  { id: "o-kabir", name: "Kabir Mahtani", relation: "Son", email: "kabir@mahtani.family", phone: "+91 98200 11003" },
  { id: "o-meera", name: "Meera Mahtani", relation: "Daughter", email: "meera@mahtani.family", phone: "+91 98200 11004" },
  { id: "o-nisha", name: "Nisha Mahtani", relation: "Sister", email: "nisha@mahtani.family", phone: "+91 98200 11005" },
  { id: "o-arjun", name: "Arjun Mahtani", relation: "Brother", email: "arjun@mahtani.family", phone: "+91 98200 11006" },
];

export function getCompany(id: string) {
  return companies.find((c) => c.id === id);
}

export function getOwner(id: string) {
  return owners.find((o) => o.id === id);
}
