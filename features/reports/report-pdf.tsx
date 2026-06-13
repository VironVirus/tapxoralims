"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";
import type { ReportBranding, ReportOrderRow } from "@/features/reports/report-utils";
import {
  buildResultRows,
  calculateOrderTotal,
  formatCurrency,
  formatDate
} from "@/features/reports/report-utils";

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
  labName: {
    fontSize: 18,
    fontWeight: 700
  },
  brandMeta: {
    color: "#475569",
    fontSize: 9,
    marginTop: 2
  },
  titleRow: {
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
  twoColumn: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18
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
  tableHeader: {
    backgroundColor: "#eff6ff",
    flexDirection: "row"
  },
  tableHeaderCell: {
    borderRightColor: "#bfdbfe",
    borderRightWidth: 1,
    color: "#0f172a",
    fontSize: 8.5,
    fontWeight: 700,
    padding: 10
  },
  tableRow: {
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    flexDirection: "row"
  },
  tableCell: {
    borderRightColor: "#e2e8f0",
    borderRightWidth: 1,
    fontSize: 8.5,
    padding: 10
  },
  flagText: {
    color: "#b91c1c",
    fontWeight: 700
  },
  normalText: {
    color: "#166534",
    fontWeight: 700
  },
  footer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    marginTop: 20
  },
  footerNote: {
    color: "#334155",
    flex: 1,
    fontSize: 9
  },
  signatureBlock: {
    minWidth: 180
  },
  signatureLine: {
    borderTopColor: "#0f172a",
    borderTopWidth: 1,
    marginBottom: 8,
    marginTop: 26
  },
  signatureText: {
    fontSize: 9,
    marginBottom: 3,
    textAlign: "center"
  }
});

function ReportPage({
  branding,
  order
}: {
  branding: ReportBranding;
  order: ReportOrderRow;
}) {
  const patient = order.patients;
  const facility = order.facilities;
  const rows = buildResultRows(order);

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {branding.logoUrl ? (
          <Image src={branding.logoUrl} style={styles.logoImage} />
        ) : (
          <View style={styles.logoFallback}>
            <Text>LN</Text>
          </View>
        )}

        <View>
          <Text style={styles.labName}>{branding.labName}</Text>
          <Text style={styles.brandMeta}>
            {facility?.code || branding.accreditation}
          </Text>
          <Text style={styles.brandMeta}>{branding.address}</Text>
          <Text style={styles.brandMeta}>{branding.supportLine}</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <View>
          <Text style={styles.eyebrow}>Patient report</Text>
          <Text style={styles.title}>Verified laboratory findings</Text>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.metaLine}>Order: {order.order_number}</Text>
          <Text style={styles.metaLine}>Ordered: {formatDate(order.ordered_at)}</Text>
          <Text style={styles.metaLine}>
            Reported: {formatDate(order.reported_at || new Date().toISOString())}
          </Text>
        </View>
      </View>

      <View style={styles.twoColumn}>
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Patient</Text>
          <Text style={styles.panelLine}>Name: {patient?.name || "Unknown patient"}</Text>
          <Text style={styles.panelLine}>Lab ID: {patient?.lab_id || "-"}</Text>
          <Text style={styles.panelLine}>Phone: {patient?.phone || "-"}</Text>
          <Text style={styles.panelLine}>Sex: {patient?.sex || "-"}</Text>
          <Text style={styles.panelLine}>DOB: {formatDate(patient?.dob || null)}</Text>
          <Text style={styles.panelLine}>Address: {patient?.address || "-"}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.eyebrow}>Clinical context</Text>
          <Text style={styles.panelLine}>
            Facility: {facility?.name || branding.labName}
          </Text>
          <Text style={styles.panelLine}>Priority: {order.priority}</Text>
          <Text style={styles.panelLine}>
            Total billed: {formatCurrency(calculateOrderTotal(order))}
          </Text>
          <Text style={styles.panelLine}>
            Notes: {order.notes || "No additional notes recorded."}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: "27%" }]}>Test</Text>
          <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Result</Text>
          <Text style={[styles.tableHeaderCell, { width: "12%" }]}>Unit</Text>
          <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
            Reference range
          </Text>
          <Text style={[styles.tableHeaderCell, { borderRightWidth: 0, width: "18%" }]}>
            Flag
          </Text>
        </View>

        {rows.map((row, index) => (
          <View key={`${order.id}-${row.sampleCode}-${index}`} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: "27%" }]}>{row.testName}</Text>
            <Text style={[styles.tableCell, { width: "18%" }]}>{row.result}</Text>
            <Text style={[styles.tableCell, { width: "12%" }]}>{row.unit}</Text>
            <Text style={[styles.tableCell, { width: "25%" }]}>
              {row.referenceRange}
            </Text>
            <Text
              style={[
                styles.tableCell,
                { borderRightWidth: 0, width: "18%" },
                row.abnormal ? styles.flagText : styles.normalText
              ]}
            >
              {row.abnormal ? "High attention" : "Normal"}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>{branding.footerNote}</Text>

        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>{branding.signatoryName}</Text>
          <Text style={styles.signatureText}>{branding.signatoryTitle}</Text>
        </View>
      </View>
    </Page>
  );
}

export function LaboratoryReportDocument({
  branding,
  orders
}: {
  branding: ReportBranding;
  orders: ReportOrderRow[];
}) {
  return (
    <Document title="Laboratory report">
      {orders.map((order) => (
        <ReportPage key={order.id} branding={branding} order={order} />
      ))}
    </Document>
  );
}
