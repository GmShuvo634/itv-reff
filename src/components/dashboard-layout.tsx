interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    walletBalance: number;
    referralCode: string;
  };
}



export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {


  return <main className="p-4 lg:p-6">{children}</main>;
}
