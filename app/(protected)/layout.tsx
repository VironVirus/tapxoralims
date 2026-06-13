import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createSupabaseServerComponentClient } from "@/lib/supabase-server";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerComponentClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
