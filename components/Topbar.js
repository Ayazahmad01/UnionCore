"use client";

import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Topbar() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email || "");
    };

    getUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

 return (
  <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-5 py-2 rounded-lg shadow">
    
    <ThemeToggle />

    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {email}
    </span>

    <button
  onClick={logout}
  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow bg-red-600 hover:bg-red-700 !bg-red-600"
>
  <LogOut size={16} />
  Logout
</button>

  </div>
);
}