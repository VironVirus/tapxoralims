"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import type { BillingInvoiceRow } from "@/features/billing/billing-utils";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getBalanceDue
} from "@/features/billing/billing-utils";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingBottom: 28,
    paddingHorizontal: 28,
    paddingTop: 28
  },
  header: {
    alignItems: "center",
    borderBottomColor: "#0f4c81",
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: 12,
    paddingBottom: 14
  },
  logoFallback: {
    alignItems: "center",
    backgroundColor: "#0f4c81",
    borderRadius: 12,
    color: "#ffffff",
    display: "flex",
    fontSize: 18,
    fontWeight: 700,
    height: 42,
    justifyContent: "center",
    textAlign: "center",
    width: 42
  },
  logoImage: {
    borderRadius: 12,
    height: 42,
    width: 42
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 700
  },
  brandMeta: {
    color: "#475569",
    fontSize: 9,
    marginTop: 2
  },
  titleWrap: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 18
  },
  eyebrow: {
    color: "#0f4c81",
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 16,
    fontWeight: 700
  },
  metaCard: {
    backgroundColor: "#f8fbff",
    borderColor: "#dbeafe",
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 180,
    padding: 12
  },
  metaLine: {
    fontSize: 9,
    marginBottom: 4
  },
  columns: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  panel: {
    backgroundColor: "#f8fbff",
    borderColor: "#dbeafe",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 12
  },
  panelLine: {
    fontSize: 9,
    marginBottom: 5
  },
  table: {
    borderColor: "#cbd5e1",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden"
  },
  row: {
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    flexDirection: "row"
  },
  headerRow: {
    backgroundColor: "#eff6ff",
    flexDirection: "row"
  },
  cell: {
    borderRightColor: "#e2e8f0",
    borderRightWidth: 1,
    fontSize: 8.5,
    padding: 10
  },
  headerCell: {
    borderRightColor: "#bfdbfe",
    borderRightWidth: 1,
    color: "#0f172a",
    fontSize: 8.5,
    fontWeight: 700,
    padding: 10
  },
  totals: {
    alignSelf: "flex-end",
    marginTop: 18,
    minWidth: 220
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  totalStrong: {
    fontSize: 11,
    fontWeight: 700
  },
  footer: {
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    color: "#475569",
    fontSize: 9,
    marginTop: 20,
    paddingTop: 12
  }
});

export function ReceiptDocument({
  invoice,
  logoUrl,
  payment
}: {
  invoice: BillingInvoiceRow;
  logoUrl?: string;
  payment: NonNullable<BillingInvoiceRow["invoice_payments"]>[number];
}) {
  const patient = invoice.orders?.patients;
  const facility = invoice.orders?.facilities;
  const items = invoice.invoice_items ?? [];

  return (
    <Document title="Payment receipt">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logoImage} />
          ) : (
            <View style={styles.logoFallback}>
              <Text>LN</Text>
            </View>
          )}
          <View>
            <Text style={styles.brandTitle}>
              {facility?.name || "LIMS Nigeria Diagnostics"}
            </Text>
            <Text style={styles.brandMeta}>
              {facility?.code || "Clinical laboratory billing desk"}
            </Text>
            <Text style={styles.brandMeta}>Official payment receipt</Text>
          </View>
        </View>

        <View style={styles.titleWrap}>
          <View>
            <Text style={styles.eyebrow}>Receipt</Text>
            <Text style={styles.title}>Laboratory payment acknowledgment</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLine}>Receipt: {payment.receipt_number}</Text>
            <Text style={styles.metaLine}>Invoice: {invoice.invoice_number}</Text>
            <Text style={styles.metaLine}>Date: {formatDateTime(payment.received_at)}</Text>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.panel}>
            <Text style={styles.eyebrow}>Patient</Text>
            <Text style={styles.panelLine}>Name: {patient?.name || "Unknown patient"}</Text>
            <Text style={styles.panelLine}>Lab ID: {patient?.lab_id || "-"}</Text>
            <Text style={styles.panelLine}>Phone: {patient?.phone || "-"}</Text>
          </View>
          <View style={styles.panel}>
            <Text style={styles.eyebrow}>Order</Text>
            <Text style={styles.panelLine}>
              Order number: {invoice.orders?.order_number || "-"}
            </Text>
            <Text style={styles.panelLine}>
              Ordered: {formatDate(invoice.orders?.ordered_at || null)}
            </Text>
            <Text style={styles.panelLine}>Priority: {invoice.orders?.priority || "-"}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { width: "50%" }]}>Service</Text>
            <Text style={[styles.headerCell, { width: "15%" }]}>Qty</Text>
            <Text style={[styles.headerCell, { width: "17.5%" }]}>Rate</Text>
            <Text style={[styles.headerCell, { borderRightWidth: 0, width: "17.5%" }]}>
              Amount
            </Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.row}>
              <Text style={[styles.cell, { width: "50%" }]}>{item.test_name}</Text>
              <Text style={[styles.cell, { width: "15%" }]}>{item.quantity}</Text>
              <Text style={[styles.cell, { width: "17.5%" }]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.cell, { borderRightWidth: 0, width: "17.5%" }]}>
                {formatCurrency(item.line_total)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalLine}>
            <Text>Invoice total</Text>
            <Text>{formatCurrency(invoice.total_amount)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text>Paid this receipt</Text>
            <Text>{formatCurrency(payment.amount)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text>Balance due</Text>
            <Text>{formatCurrency(getBalanceDue(invoice))}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalStrong}>Payment method</Text>
            <Text style={styles.totalStrong}>{payment.payment_method}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This receipt confirms payment collection and should be retained for financial
          reconciliation and patient support.
        </Text>
      </Page>
    </Document>
  );
}

