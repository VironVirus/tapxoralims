"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileStack,
  Loader2,
  ShieldAlert,
  TestTube2
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { canAccessPatientsRole } from "@/lib/guards";
import {
  cacheOrdersWithRelations,
  cachePatients,
  getPatientLocal,
  getPatientOrdersLocal
} from "@/lib/offline-data";
import { resolveOfflineQuery } from "@/lib/offline-core";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Tables } from "@/types/supabase";

type PatientRow = Tables<"patients">;
type OrderHistoryRow = {
  id: string;
  order_number: string;
  status: Tables<"orders">["status"];
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_tests: Array<{
    id: string;
    sample_code: string;
    status: Tables<"order_tests">["status"];
    tests: {
      id: string;
      name: string;
      result_type: Tables<"tests">["result_type"];
    } | null;
  }> | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

async function fetchPatient(patientId: string) {
  const supabase = getSupabaseBrowserClient();
  return resolveOfflineQuery<PatientRow | null>({
    cacheKey: `patient:${patientId}`,
    offline: async () => (await getPatientLocal(patientId)) ?? null,
    online: async () => {
      if (!supabase) {
        return (await getPatientLocal(patientId)) ?? null;
      }

      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        await cachePatients([data]);
      }

      return (data as PatientRow | null) ?? null;
    }
  });
}

async function fetchPatientOrders(patientId: string) {
  const supabase = getSupabaseBrowserClient();
  return resolveOfflineQuery<OrderHistoryRow[]>({
    cacheKey: `patient-orders:${patientId}`,
    offline: () => getPatientOrdersLocal(patientId),
    online: async () => {
      if (!supabase) {
        return getPatientOrdersLocal(patientId);
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, priority, notes, created_at, updated_at, patient_id, facility_id, ordered_at, ordered_by, reported_at, order_tests(id, order_id, test_id, sample_code, status, specimen_label, barcode_value, qr_value, created_at, updated_at, collected_at, collected_by, in_progress_at, results_entered_at, verified_at, reported_at, tests(id, name, result_type))"
        )
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      await cacheOrdersWithRelations((data ?? []) as Record<string, unknown>[]);
      return (data ?? []) as OrderHistoryRow[];
    }
  });
}

export function PatientHistory({ patientId }: { patientId: string }) {
  const { role, loading, facilityId } = useAuth();
  const canViewPatients = canAccessPatientsRole(role);

  const patientQuery = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => fetchPatient(patientId),
    enabled: canViewPatients && Boolean(facilityId)
  });

  const ordersQuery = useQuery({
    queryKey: ["patient-orders", patientId],
    queryFn: () => fetchPatientOrders(patientId),
    enabled: canViewPatients && Boolean(facilityId)
  });

  if (loading) {
    return (
      <Card className="border-blue-100">
        <CardContent className="flex items-center gap-3 p-6 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          Loading patient history...
        </CardContent>
      </Card>
    );
  }

  if (!canViewPatients || !facilityId) {
    return (
      <Card className="border-red-100 bg-red-50/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <ShieldAlert className="h-5 w-5" />
            Access unavailable
          </CardTitle>
          <CardDescription className="text-red-800">
            You need patient access and a facility assignment to view this record.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (patientQuery.isLoading || ordersQuery.isLoading) {
    return (
      <Card className="border-blue-100">
        <CardContent className="flex items-center gap-3 p-6 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          Loading patient history...
        </CardContent>
      </Card>
    );
  }

  if (patientQuery.isError) {
    return (
      <Card className="border-red-100 bg-red-50/70">
        <CardHeader>
          <CardTitle className="text-red-900">Unable to load patient</CardTitle>
          <CardDescription className="text-red-800">
            {(patientQuery.error as Error).message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (ordersQuery.isError) {
    return (
      <Card className="border-red-100 bg-red-50/70">
        <CardHeader>
          <CardTitle className="text-red-900">Unable to load order history</CardTitle>
          <CardDescription className="text-red-800">
            {(ordersQuery.error as Error).message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const patient = patientQuery.data;
  const orders = ordersQuery.data ?? [];

  const formatOrderStatus = (status: OrderHistoryRow["status"]) =>
    status.replaceAll("_", " ");

  if (!patient) {
    return (
      <Card className="border-amber-200 bg-amber-50/80">
        <CardHeader>
          <CardTitle className="text-amber-950">Patient not found</CardTitle>
          <CardDescription className="text-amber-900">
            This patient is unavailable or outside your facility scope.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" className="mb-2 px-0 text-blue-700 hover:text-blue-800">
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4" />
              Back to patients
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-slate-950">{patient.name}</h1>
          <p className="text-sm text-slate-600">
            {patient.lab_id} • {patient.phone || "No phone number"}
          </p>
        </div>
        <Badge variant="outline">{orders.length} orders</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardDescription>Sex</CardDescription>
            <CardTitle className="text-lg text-slate-950">
              {patient.sex || "Not recorded"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardDescription>Date of birth</CardDescription>
            <CardTitle className="text-lg text-slate-950">
              {patient.dob || "Not recorded"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardDescription>Email</CardDescription>
            <CardTitle className="text-lg text-slate-950">
              {patient.email || "Not recorded"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardDescription>Emergency contact</CardDescription>
            <CardTitle className="text-lg text-slate-950">
              {patient.emergency_contact || "Not recorded"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardDescription>NDPR consent</CardDescription>
            <CardTitle className="text-lg text-slate-950">
              {patient.ndpr_consent ? "Consented" : "Not recorded"}
            </CardTitle>
            <p className="text-xs text-slate-500">
              {patient.ndpr_consent_at
                ? `Captured ${formatDateTime(patient.ndpr_consent_at)}`
                : "Consent timestamp unavailable"}
            </p>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="h-5 w-5 text-blue-700" />
            Previous orders
          </CardTitle>
          <CardDescription>
            Historical test orders and recorded results for this patient.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 px-5 py-8 text-center text-sm text-slate-600">
              No previous orders found for this patient yet.
            </div>
          ) : null}

          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{order.order_number}</p>
                    <Badge variant="secondary">{formatOrderStatus(order.status)}</Badge>
                    <Badge variant="outline">{order.priority}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Ordered on {formatDateTime(order.created_at)}
                  </p>
                  {order.notes ? (
                    <p className="text-sm text-slate-600">{order.notes}</p>
                  ) : null}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                {order.order_tests && order.order_tests.length > 0 ? (
                  order.order_tests.map((result) => (
                    <div
                      key={result.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                          <TestTube2 className="h-4 w-4 text-blue-700" />
                          <p className="font-medium text-slate-900">
                            {result.tests?.name || "Unknown test"}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {result.tests?.result_type || "result"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">
                        Sample {result.sample_code} is currently in{" "}
                        {formatOrderStatus(result.status)}.
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">
                    No sample entries have been recorded for this order yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
