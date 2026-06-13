"use client";

import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { useOffline } from "@/components/offline-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { db, type ConflictRecord, type QueueRecord } from "@/lib/dexie";
import {
  clearResolvedQueueItems,
  retryAllQueueConflicts,
  retryQueueConflict
} from "@/lib/offline-core";

export function OfflineSyncPanel() {
  const { conflicts, failed, isOnline, pending, processing, syncNow } = useOffline();
  const [queueItems, setQueueItems] = useState<QueueRecord[]>([]);
  const [conflictItems, setConflictItems] = useState<ConflictRecord[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const queueSubscription = liveQuery(() =>
      db.sync_queue.orderBy("createdAt").reverse().limit(10).toArray()
    ).subscribe({
      next: setQueueItems,
      error: () => {
        // Ignore local live query failures.
      }
    });

    const conflictSubscription = liveQuery(() =>
      db.sync_conflicts.filter((row) => row.resolvedAt === null).reverse().sortBy("createdAt")
    ).subscribe({
      next: (rows) => setConflictItems(rows.slice(0, 8)),
      error: () => {
        // Ignore local live query failures.
      }
    });

    return () => {
      queueSubscription.unsubscribe();
      conflictSubscription.unsubscribe();
    };
  }, []);

  const handleResolveConflict = async (conflictId: string) => {
    await db.sync_conflicts.update(conflictId, {
      resolvedAt: new Date().toISOString()
    });
  };

  const handleRetryConflict = async (conflictId: string) => {
    setBusy(true);
    await retryQueueConflict(conflictId);
    setBusy(false);
  };

  const handleSyncNow = async () => {
    setBusy(true);
    await syncNow();
    setBusy(false);
  };

  const handleRetryAllConflicts = async () => {
    setBusy(true);
    await retryAllQueueConflicts();
    setBusy(false);
  };

  const handleClearHistory = async () => {
    setBusy(true);
    await clearResolvedQueueItems();
    setBusy(false);
  };

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-blue-700" />
              Offline sync control
            </CardTitle>
            <CardDescription>
              Review queued mutations, replay them when connected, and manually acknowledge
              critical conflicts.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Badge variant="outline">{pending} pending</Badge>
            {failed > 0 ? <Badge variant="secondary">{failed} failed</Badge> : null}
            {conflicts > 0 ? (
              <Badge className="border-transparent bg-amber-100 text-amber-700">
                {conflicts} conflicts
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button disabled={!isOnline || processing || busy} onClick={() => void handleSyncNow()}>
            {processing || busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync now
          </Button>
          <Button
            disabled={!isOnline || busy || conflictItems.length === 0}
            variant="outline"
            onClick={() => void handleRetryAllConflicts()}
          >
            <RefreshCw className="h-4 w-4" />
            Retry all conflicts
          </Button>
          <Button disabled={busy} variant="outline" onClick={() => void handleClearHistory()}>
            Clear synced history
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900">Queued mutations</p>
            {queueItems.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No local mutations are queued right now.
              </div>
            ) : (
              queueItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.entity} / {item.action}
                      </p>
                      <p className="text-xs text-slate-500">{item.recordId}</p>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  {item.lastError ? (
                    <p className="mt-2 text-sm text-red-700">{item.lastError}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900">Critical conflicts</p>
            {conflictItems.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm text-emerald-800">
                No unresolved conflicts are waiting for manual review.
              </div>
            ) : (
              conflictItems.map((conflict) => (
                <div
                  key={conflict.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-amber-950">
                        <AlertTriangle className="h-4 w-4" />
                        {conflict.entity} conflict
                      </p>
                      <p className="mt-1 text-sm text-amber-900">{conflict.reason}</p>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-xs text-slate-700">
                        {JSON.stringify(
                          {
                            local: conflict.localPayload,
                            remote: conflict.remotePayload
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isOnline || busy}
                      onClick={() => void handleRetryConflict(conflict.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleResolveConflict(conflict.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
