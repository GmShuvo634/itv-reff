import DashboardHeader from "@/components/DashboardHeader";
import DashboardMenubarNavigation from "@/components/DashboardMenuNavigation";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <DashboardMenubarNavigation />
    </div>
  );
}
