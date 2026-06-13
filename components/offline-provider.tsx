"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { liveQuery } from "dexie";
import { getSyncSummary, syncPendingMutations } from "@/lib/offline-core";
import { useOnlineStatus } from "@/hooks/use-online-status";

type OfflineContextValue = {
  conflicts: number;
  failed: number;
  isOnline: boolean;
  lastSyncedAt: string | null;
  pending: number;
  processing: boolean;
  syncNow: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();
  const [summary, setSummary] = useState({
    conflicts: 0,
    failed: 0,
    lastSyncedAt: null as string | null,
    pending: 0,
    processing: false
  });

  useEffect(() => {
    const subscription = liveQuery(() => getSyncSummary()).subscribe({
      next: (value) => setSummary(value),
      error: () => {
        // Ignore reactive summary failures and keep the most recent stable state.
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    void syncPendingMutations();

    const interval = window.setInterval(() => {
      void syncPendingMutations();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [isOnline]);

  const value = useMemo<OfflineContextValue>(
    () => ({
      ...summary,
      isOnline,
      syncNow: async () => {
        await syncPendingMutations();
      }
    }),
    [isOnline, summary]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }

  return context;
}
