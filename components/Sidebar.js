"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Receipt,
  BarChart,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", path: "/clients", icon: Users },
    { name: "Invoices", path: "/invoices", icon: FileText },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Tax Filing", path: "/tax", icon: Receipt },
    { name: "Reports", path: "/reports", icon: BarChart },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200 bg-white/95 text-gray-900 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-gray-800">
        <div className="flex justify-center">
          <div className="w-44">
            <Image
              src="/logo.png"
              alt="UnionCore Logo"
              width={195}
              height={50}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <nav className="p-4">
        {menu.map((item) => {
          const active = pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              <Icon size={20} className={active ? "text-white" : ""} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}