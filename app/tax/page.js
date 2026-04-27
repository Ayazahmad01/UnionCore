"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function TaxPage() {
  const [clients, setClients] = useState([]);
  const [taxRecords, setTaxRecords] = useState([]);

  const [clientId, setClientId] = useState("");
  const [taxType, setTaxType] = useState("VAT");
  const [period, setPeriod] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("pending");

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*");
    setClients(data || []);
  };

  const fetchTaxRecords = async () => {
    const { data } = await supabase
      .from("tax_filings")
      .select("*, clients(company_name)")
      .order("created_at", { ascending: false });

    setTaxRecords(data || []);
  };

  const addTaxRecord = async () => {
    if (!clientId || !period || !amount) {
      alert("Client, period and amount are required");
      return;
    }

    const { error } = await supabase.from("tax_filings").insert([
      {
        client_id: clientId,
        tax_type: taxType,
        period,
        amount,
        status,
      },
    ]);

    if (error) alert(error.message);
    else {
      setClientId("");
      setTaxType("VAT");
      setPeriod("");
      setAmount("");
      setStatus("pending");
      fetchTaxRecords();
    }
  };

  useEffect(() => {
    fetchClients();
    fetchTaxRecords();
  }, []);

  const statusStyle = (status) => {
    if (status === "paid") return "bg-green-100 text-green-700";
    if (status === "filed") return "bg-blue-100 text-blue-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const inputStyle =
    "rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900";

  const primaryButton =
    "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-medium text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg";

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-8 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Tax Compliance
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Tax Filing
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage VAT and Corporate Tax filing records for clients.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Add Tax Filing
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputStyle}
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name}
              </option>
            ))}
          </select>

          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value)}
            className={inputStyle}
          >
            <option value="VAT">VAT</option>
            <option value="Corporate Tax">Corporate Tax</option>
          </select>

          <input
            placeholder="Period e.g. Q1 2026"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={inputStyle}
          />

          <input
            type="number"
            placeholder="Amount (AED)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputStyle}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputStyle}
          >
            <option value="pending">Pending</option>
            <option value="filed">Filed</option>
            <option value="paid">Paid</option>
          </select>

          <button onClick={addTaxRecord} className={primaryButton}>
            Add Filing
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gradient-to-r from-gray-900 to-slate-800 text-white">
            <tr>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Tax Type</th>
              <th className="px-5 py-4">Period</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {taxRecords.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-300"
                >
                  No tax records found
                </td>
              </tr>
            ) : (
              taxRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {record.clients?.company_name || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {record.tax_type}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {record.period}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {record.amount} AED
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyle(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}