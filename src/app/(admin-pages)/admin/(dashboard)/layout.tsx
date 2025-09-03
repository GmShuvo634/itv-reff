
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
