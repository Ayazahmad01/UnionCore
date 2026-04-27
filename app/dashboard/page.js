"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const fetchStats = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
      return;
    }

    const { data: clientsData } = await supabase.from("clients").select("*");
    const { data: invoicesData } = await supabase.from("invoices").select("*");
    const { data: paymentsData } = await supabase.from("payments").select("*");

    setClients(clientsData || []);
    setInvoices(invoicesData || []);
    setPayments(paymentsData || []);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const activeClients = clients.filter((c) => c.status !== "inactive");
  const validInvoices = invoices.filter((i) => i.status !== "cancelled");

  const totalInvoiceAmount = validInvoices.reduce(
    (sum, inv) => sum + Number(inv.amount || 0) * 1.05,
    0
  );

  const totalPaidAmount = payments.reduce(
    (sum, pay) => sum + Number(pay.amount || 0),
    0
  );

  const unpaidAmount = Math.max(totalInvoiceAmount - totalPaidAmount, 0);

  const barData = [
    { name: "Invoices", amount: Number(totalInvoiceAmount.toFixed(2)) },
    { name: "Paid", amount: Number(totalPaidAmount.toFixed(2)) },
    { name: "Unpaid", amount: Number(unpaidAmount.toFixed(2)) },
  ];

  const pieData = [
    { name: "Paid", value: Number(totalPaidAmount.toFixed(2)) },
    { name: "Unpaid", value: Number(unpaidAmount.toFixed(2)) },
  ];

  const cardStyle =
    "rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/80";

  const navButton =
    "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg";

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-8 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          UnionCore Workspace
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Accounting, tax, payments, and client management overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
        <div className={cardStyle}>
          <h3 className="text-sm text-gray-500 dark:text-gray-300">
            Active Clients
          </h3>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {activeClients.length}
          </h2>
        </div>

        <div className={cardStyle}>
          <h3 className="text-sm text-gray-500 dark:text-gray-300">Invoices</h3>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {validInvoices.length}
          </h2>
        </div>

        <div className={cardStyle}>
          <h3 className="text-sm text-gray-500 dark:text-gray-300">
            Invoice Total
          </h3>
          <h2 className="mt-2 text-2xl font-bold text-blue-600">
            {totalInvoiceAmount.toFixed(2)} AED
          </h2>
        </div>

        <div className={cardStyle}>
          <h3 className="text-sm text-gray-500 dark:text-gray-300">Paid</h3>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {totalPaidAmount.toFixed(2)} AED
          </h2>
        </div>

        <div className={cardStyle}>
          <h3 className="text-sm text-gray-500 dark:text-gray-300">Unpaid</h3>
          <h2 className="mt-2 text-2xl font-bold text-red-600">
            {unpaidAmount.toFixed(2)} AED
          </h2>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Financial Overview
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#2563eb" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Paid vs Unpaid
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={105}
              >
                <Cell fill="#16a34a" />
                <Cell fill="#dc2626" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <button onClick={() => router.push("/clients")} className={navButton}>
          Clients
        </button>
        <button onClick={() => router.push("/invoices")} className={navButton}>
          Invoices
        </button>
        <button onClick={() => router.push("/payments")} className={navButton}>
          Payments
        </button>
        <button onClick={() => router.push("/tax")} className={navButton}>
          Tax
        </button>
        <button onClick={() => router.push("/reports")} className={navButton}>
          Reports
        </button>
      </div>
    </div>
  );
}