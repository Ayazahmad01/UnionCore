"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 p-6">

      {/* Animated glow background */}
      <div className="absolute left-20 top-20 h-72 w-72 animate-pulse rounded-full bg-blue-500/30 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 h-96 w-96 animate-pulse rounded-full bg-indigo-500/30 blur-3xl"></div>

      {/* Floating glass card */}
      <div className="animate-[float_6s_ease-in-out_infinite] relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <img
            src="/logo.png"
            alt="UnionCore"
            className="h-12 w-auto object-contain opacity-95"
          />
        </div>

        {/* Title */}
        <h1 className="mt-2 text-center text-2xl font-bold text-white">
          Welcome to UnionCore
        </h1>

        <p className="mb-6 text-center text-sm text-gray-300">
          Accounting & Client Management System
        </p>

        {/* Inputs */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/90 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/30"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/90 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/30"
          />
        </div>

        {/* Button */}
        <button
          onClick={login}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-300">
          Secure access for authorized users only
        </p>
      </div>
    </div>
  );
}