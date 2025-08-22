"use client";

import {
  CopyCheck,
  GitCompare,
  Home,
  LucideIcon,
  Share,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  id: string;
}

const DashboardMenubarNavigation = () => {
  const pathname = usePathname();

  const navItems: NavItemProps[] = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
      id: "home",
    },
    {
      icon: CopyCheck,
      label: "Task",
      href: "/task",
      id: "task",
    },
    {
      icon: Share,
      label: "VIP",
      href: "/vip",
      id: "vip",
    },
    {
      icon: GitCompare,
      label: "Profit",
      href: "/profit",
      id: "profit",
    },
    {
      icon: User,
      label: "My",
      href: "/user",
      id: "my",
    },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col flex-shrink-0">
      <div className="h-[52px] bg-black/70 text-white">
        <nav className="flex items-center justify-between h-full pt-[12px] pl-[14px] pr-[14px]">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link href={item.href} key={item.id}>
                <div className="transition-colors hover:bg-gray-700/50 flex flex-col items-center">
                  <IconComponent
                    size={20}
                    className={`${
                      isActive ? "text-yellow-400" : "text-gray-400"
                    } transition-colors`}
                  />
                  <span
                    className={`text-xs ${
                      isActive ? "text-yellow-400" : "text-gray-400"
                    } transition-colors`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardMenubarNavigation;
