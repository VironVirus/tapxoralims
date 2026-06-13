import dynamic from "next/dynamic";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";

const ResultsWorkspace = dynamic(
  () => import("@/features/results/results-workspace").then((mod) => mod.ResultsWorkspace),
  {
    loading: () => <WorkspaceSkeleton />
  }
);

export default function ResultsPage() {
  return <ResultsWorkspace />;
}
