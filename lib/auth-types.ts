import type { Database } from "@/types/supabase";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const appRoles: AppRole[] = [
  "Admin",
  "Receptionist",
  "LabScientist",
  "Verifier",
  "Accountant"
];

export type UserProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  facility_id: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};
