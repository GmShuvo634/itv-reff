import DashboardHeader from "@/components/DashboardHeader";
import DashboardMenubarNavigation from "@/components/DashboardMenuNavigation";
import { DashboardScrollableLayout } from "@/components/scrollable-layout";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative h-full flex flex-col">
      <DashboardScrollableLayout>
        <DashboardHeader />
          {children}
      </DashboardScrollableLayout>
      <DashboardMenubarNavigation />
    </div>
  );
}
