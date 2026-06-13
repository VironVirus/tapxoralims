import dynamic from "next/dynamic";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";

const DashboardOverview = dynamic(
  () => import("@/features/dashboard/dashboard-overview").then((mod) => mod.DashboardOverview),
  {
    loading: () => <WorkspaceSkeleton />
  }
);

export default function DashboardPage() {
  return <DashboardOverview />;
}
