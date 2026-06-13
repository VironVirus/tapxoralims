"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { db } from "@/lib/dexie";
import { cacheProfiles } from "@/lib/offline-data";
import { resolveOfflineQuery } from "@/lib/offline-core";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { AppRole, UserProfile } from "@/lib/auth-types";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: AppRole | null;
  facilityId: string | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  return resolveOfflineQuery<UserProfile | null>({
    cacheKey: `profile:${userId}`,
    offline: async () => (await db.profiles.get(userId)) ?? null,
    online: async () => {
      if (!supabase) {
        return (await db.profiles.get(userId)) ?? null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, facility_id, role, created_at, updated_at")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      await cacheProfiles([data as UserProfile]);
      return data as UserProfile;
    }
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => getSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = async (userId: string | null) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    const nextProfile = await loadProfile(userId);
    setProfile(nextProfile);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }

      setSession(data.session);
      await syncProfile(data.session?.user.id ?? null);
      if (mounted) {
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await syncProfile(nextSession?.user.id ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const refreshProfile = async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    setProfile(await loadProfile(session.user.id));
  };

  const signOut = async () => {
    if (!supabase) {
      setSession(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    facilityId: profile?.facility_id ?? null,
    loading,
    refreshProfile,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
