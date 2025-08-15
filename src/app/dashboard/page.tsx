import { redirect } from "next/navigation";
import { getUserFromServer } from "@/lib/auth";
import DashboardLayout from "@/components/dashboard-layout";
import DashboardOverview from "@/components/dashboard-overview";

export default async function DashboardPage() {
  const user = await getUserFromServer();
  if (!user) redirect("/");

  return (
    <DashboardLayout user={user}>
      <DashboardOverview />
    </DashboardLayout>
  );
}
