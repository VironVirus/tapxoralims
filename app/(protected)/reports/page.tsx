import dynamic from "next/dynamic";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";

const ReportsWorkspace = dynamic(
  () => import("@/features/reports/reports-workspace").then((mod) => mod.ReportsWorkspace),
  {
    loading: () => <WorkspaceSkeleton />
  }
);

export default function ReportsPage() {
  return <ReportsWorkspace />;
}
