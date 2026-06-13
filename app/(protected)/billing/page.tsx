import dynamic from "next/dynamic";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";

const BillingWorkspace = dynamic(
  () => import("@/features/billing/billing-workspace").then((mod) => mod.BillingWorkspace),
  {
    loading: () => <WorkspaceSkeleton />
  }
);

export default function BillingPage() {
  return <BillingWorkspace />;
}
