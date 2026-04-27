"use client";
import Topbar from "./Topbar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      if (pathname === "/login") {
        setChecking(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

if (!data.session) {
  router.push("/login");
} else {
  setChecking(false);
}
    };

    checkUser();
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (checking) {
    return <div className="p-10">Loading...</div>;
  }

 return (
  <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-100 dark:bg-gray-900">
    <Sidebar />

    <main className="ml-64 flex-1 p-6">
      <div className="flex justify-end">
        <Topbar />
      </div>

      {children}
    </main>
  </div>
);
}