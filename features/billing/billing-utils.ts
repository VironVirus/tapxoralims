import type { Tables } from "@/types/supabase";

export type InvoicePaymentStatus = Tables<"invoices">["payment_status"];

export type BillingInvoiceRow = Tables<"invoices"> & {
  invoice_items: Tables<"invoice_items">[] | null;
  invoice_payments: Tables<"invoice_payments">[] | null;
  orders: {
    id: string;
    order_number: string;
    ordered_at: string;
    priority: string;
    facilities: {
      code: string;
      id: string;
      name: string;
    } | null;
    patients: {
      id: string;
      lab_id: string;
      name: string;
      phone: string | null;
    } | null;
  } | null;
};

export const paymentMethodOptions = [
  "Cash",
  "Transfer",
  "POS",
  "Card",
  "Mobile Money"
] as const;

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    currency: "NGN",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  }).format(value ?? 0);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getBalanceDue(invoice: Pick<BillingInvoiceRow, "amount_paid" | "total_amount">) {
  return Math.max(Number(invoice.total_amount) - Number(invoice.amount_paid), 0);
}

export function matchesInvoiceSearch(invoice: BillingInvoiceRow, search: string) {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return [
    invoice.invoice_number,
    invoice.orders?.order_number,
    invoice.orders?.patients?.name,
    invoice.orders?.patients?.lab_id,
    invoice.orders?.patients?.phone
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export function isToday(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function getPaymentStatusTone(status: InvoicePaymentStatus) {
  if (status === "Paid") {
    return "paid" as const;
  }

  if (status === "Partial") {
    return "partial" as const;
  }

  return "unpaid" as const;
}

