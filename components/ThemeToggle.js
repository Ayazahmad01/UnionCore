"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}