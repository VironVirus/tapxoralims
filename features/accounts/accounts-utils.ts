import { formatCurrency } from "@/features/billing/billing-utils";
import type { Tables } from "@/types/supabase";

export type AccountInvoiceRow = Tables<"invoices"> & {
  invoice_items:
    | Array<
        Tables<"invoice_items"> & {
          order_tests?: {
            test_id: string;
            tests?: {
              category: string | null;
              id: string;
              name: string;
            } | null;
          } | null;
        }
      >
    | null;
  invoice_payments: Tables<"invoice_payments">[] | null;
  orders: {
    id: string;
    order_number: string;
    ordered_at: string;
    patients: {
      id: string;
      lab_id: string;
      name: string;
      phone: string | null;
    } | null;
  } | null;
};

export type AccountExpenseRow = Tables<"expenses"> & {
  inventory_items?: {
    category: string | null;
    id: string;
    name: string;
    unit: string;
  } | null;
};

export type IncomeByTestRow = {
  category: string;
  quantity: number;
  revenue: number;
  testName: string;
};

export type IncomeByCategoryRow = {
  category: string;
  revenue: number;
  tests: number;
};

export type InventoryCostRow = Tables<"inventory_transactions"> & {
  itemName: string;
  unit: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

export function getMonthRange(monthKey: string) {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  return {
    end,
    start
  };
}

export function isWithinMonth(value: string | null | undefined, monthKey: string) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const { end, start } = getMonthRange(monthKey);
  return date >= start && date < end;
}

export function normalizeCategory(value: string | null | undefined) {
  return value?.trim() || "Uncategorized";
}

export function buildIncomeByTest(
  invoices: AccountInvoiceRow[],
  fallbackTestMeta: Map<string, { category: string; name: string }>,
  monthKey: string
) {
  const totals = new Map<string, IncomeByTestRow>();

  invoices
    .filter((invoice) => isWithinMonth(invoice.issued_at, monthKey))
    .forEach((invoice) => {
      (invoice.invoice_items ?? []).forEach((item) => {
        const relation = item.order_tests?.tests ?? null;
        const fallback = item.order_test_id ? fallbackTestMeta.get(item.order_test_id) : null;
        const testName = relation?.name || fallback?.name || item.test_name;
        const category = normalizeCategory(relation?.category || fallback?.category || null);
        const key = `${category}::${testName}`;
        const current = totals.get(key) ?? {
          category,
          quantity: 0,
          revenue: 0,
          testName
        };

        current.quantity += Number(item.quantity);
        current.revenue += Number(item.line_total);
        totals.set(key, current);
      });
    });

  return [...totals.values()].sort((left, right) => right.revenue - left.revenue);
}

export function buildIncomeByCategory(rows: IncomeByTestRow[]) {
  const totals = new Map<string, IncomeByCategoryRow>();

  rows.forEach((row) => {
    const current = totals.get(row.category) ?? {
      category: row.category,
      revenue: 0,
      tests: 0
    };
    current.revenue += row.revenue;
    current.tests += 1;
    totals.set(row.category, current);
  });

  return [...totals.values()].sort((left, right) => right.revenue - left.revenue);
}

export function buildAccountsSummary(args: {
  expenses: AccountExpenseRow[];
  invoices: AccountInvoiceRow[];
  monthKey: string;
  payments: Tables<"invoice_payments">[];
  transactions: Tables<"inventory_transactions">[];
}) {
  const billed = args.invoices
    .filter((invoice) => isWithinMonth(invoice.issued_at, args.monthKey))
    .reduce((sum, invoice) => sum + Number(invoice.total_amount), 0);

  const collected = args.payments
    .filter((payment) => isWithinMonth(payment.received_at, args.monthKey))
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  const outstanding = args.invoices.reduce(
    (sum, invoice) => sum + Math.max(Number(invoice.total_amount) - Number(invoice.amount_paid), 0),
    0
  );

  const manualExpenses = args.expenses
    .filter((expense) => isWithinMonth(expense.expense_date, args.monthKey))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const inventoryPurchaseCost = args.transactions
    .filter(
      (transaction) =>
        transaction.transaction_type === "stock_in" &&
        isWithinMonth(transaction.created_at, args.monthKey)
    )
    .reduce((sum, transaction) => sum + Number(transaction.total_cost), 0);

  const inventoryUsageCost = args.transactions
    .filter(
      (transaction) =>
        (transaction.transaction_type === "usage" ||
          transaction.transaction_type === "stock_out") &&
        isWithinMonth(transaction.created_at, args.monthKey)
    )
    .reduce((sum, transaction) => sum + Number(transaction.total_cost), 0);

  return {
    billed,
    collected,
    inventoryPurchaseCost,
    inventoryUsageCost,
    manualExpenses,
    netCashflow: collected - (manualExpenses + inventoryPurchaseCost),
    outstanding,
    totalCost: manualExpenses + inventoryPurchaseCost + inventoryUsageCost
  };
}

export function buildInventoryCostRows(
  transactions: Tables<"inventory_transactions">[],
  itemMap: Map<string, { name: string; unit: string }>,
  monthKey: string
) {
  return transactions
    .filter(
      (transaction) =>
        isWithinMonth(transaction.created_at, monthKey) &&
        Number(transaction.total_cost) > 0
    )
    .map((transaction) => ({
      ...transaction,
      itemName: itemMap.get(transaction.item_id)?.name || "Unknown item",
      unit: itemMap.get(transaction.item_id)?.unit || "units"
    }))
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportAccountsWorkbook(args: {
  expenseRows: Array<Record<string, string | number>>;
  incomeByCategory: IncomeByCategoryRow[];
  incomeByTest: IncomeByTestRow[];
  inventoryCostRows: Array<Record<string, string | number>>;
  invoiceRows: Array<Record<string, string | number>>;
  monthKey: string;
  summary: ReturnType<typeof buildAccountsSummary>;
}) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet([
    {
      "Month": args.monthKey,
      "Total Billed": args.summary.billed,
      "Total Collected": args.summary.collected,
      "Outstanding": args.summary.outstanding,
      "Manual Expenses": args.summary.manualExpenses,
      "Inventory Purchase Cost": args.summary.inventoryPurchaseCost,
      "Inventory Usage Cost": args.summary.inventoryUsageCost,
      "Total Cost": args.summary.totalCost,
      "Net Cashflow": args.summary.netCashflow
    }
  ]);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(args.invoiceRows), "Invoices");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(args.incomeByTest), "Income By Test");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(args.incomeByCategory),
    "Income By Category"
  );
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(args.expenseRows), "Expenses");
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(args.inventoryCostRows),
    "Inventory Costs"
  );

  const workbookBytes = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  const blob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  downloadBlob(blob, `lims-accounts-${args.monthKey}.xlsx`);
}

export function buildInvoiceExportRows(invoices: AccountInvoiceRow[]) {
  return invoices.map((invoice) => ({
    "Invoice": invoice.invoice_number,
    "Issued At": invoice.issued_at,
    "Order Number": invoice.orders?.order_number || "-",
    "Patient": invoice.orders?.patients?.name || "Unknown patient",
    "Lab ID": invoice.orders?.patients?.lab_id || "-",
    "Billed Tests": (invoice.invoice_items ?? []).map((item) => item.test_name).join(", "),
    "Payment Status": invoice.payment_status,
    "Total Amount": Number(invoice.total_amount),
    "Amount Paid": Number(invoice.amount_paid),
    "Balance Due": Math.max(Number(invoice.total_amount) - Number(invoice.amount_paid), 0)
  }));
}

export function buildExpenseExportRows(expenses: AccountExpenseRow[]) {
  return expenses.map((expense) => ({
    "Date": expense.expense_date,
    "Title": expense.title,
    "Category": expense.category,
    "Source": expense.source,
    "Amount": Number(expense.amount),
    "Notes": expense.notes || ""
  }));
}

export function buildInventoryCostExportRows(rows: InventoryCostRow[]) {
  return rows.map((row) => ({
    "Date": row.created_at,
    "Item": row.itemName,
    "Type": row.transaction_type,
    "Quantity": Number(row.quantity),
    "Unit": row.unit,
    "Unit Cost": Number(row.unit_cost),
    "Total Cost": Number(row.total_cost),
    "Reason": row.reason || ""
  }));
}

export { formatCurrency };
