import dynamic from "next/dynamic";
import { WorkspaceSkeleton } from "@/components/workspace-skeleton";

const OrdersManagement = dynamic(
  () => import("@/features/orders/orders-management").then((mod) => mod.OrdersManagement),
  {
    loading: () => <WorkspaceSkeleton />
  }
);

export default function OrdersPage() {
  return <OrdersManagement />;
}
