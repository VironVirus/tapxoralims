import dynamic from "next/dynamic";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";

const AccountsWorkspace = dynamic(
  () => import("@/features/accounts/accounts-workspace").then((mod) => mod.AccountsWorkspace),
  {
    loading: () => <WorkspaceSkeleton />
  }
);

export default function AccountsPage() {
  return <AccountsWorkspace />;
}
