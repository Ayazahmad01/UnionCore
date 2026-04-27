"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [clients, setClients] = useState([]);
  const [reports, setReports] = useState([]);

  const [clientId, setClientId] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("Financial Statement");

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*");
    setClients(data || []);
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from("reports")
      .select("*, clients(company_name)")
      .order("created_at", { ascending: false });

    setReports(data || []);
  };

  const addReport = async () => {
    if (!clientId || !reportName) {
      alert("Client and report name are required");
      return;
    }

    const { error } = await supabase.from("reports").insert([
      {
        client_id: clientId,
        report_name: reportName,
        report_type: reportType,
      },
    ]);

    if (error) alert(error.message);
    else {
      setClientId("");
      setReportName("");
      setReportType("Financial Statement");
      fetchReports();
    }
  };

  const exportClients = async () => {
    const { data } = await supabase.from("clients").select("*");
    const ws = XLSX.utils.json_to_sheet(data || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "UnionCore_Clients.xlsx");
  };

  const exportInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("invoice_number, amount, status, invoice_date, currency, clients(company_name)");

    const formatted = (data || []).map((inv) => ({
      Invoice_No: inv.invoice_number,
      Client: inv.clients?.company_name || "-",
      Amount_Before_VAT: Number(inv.amount || 0),
      VAT_5: Number(inv.amount || 0) * 0.05,
      Total_AED: Number(inv.amount || 0) * 1.05,
      Currency: inv.currency || "AED",
      Status: inv.status,
      Date: inv.invoice_date,
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "UnionCore_Invoices.xlsx");
  };

  const exportPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("amount, currency, payment_method, reference_number, payment_date, invoices(invoice_number, clients(company_name))");

    const formatted = (data || []).map((p) => ({
      Invoice_No: p.invoices?.invoice_number || "-",
      Client: p.invoices?.clients?.company_name || "-",
      Amount: Number(p.amount || 0),
      Currency: p.currency || "AED",
      Method: p.payment_method || "-",
      Reference: p.reference_number || "-",
      Date: p.payment_date || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "UnionCore_Payments.xlsx");
  };

  const exportFullBackup = async () => {
    const { data: clientsData } = await supabase.from("clients").select("*");

    const { data: invoicesData } = await supabase
      .from("invoices")
      .select("invoice_number, amount, status, invoice_date, currency, clients(company_name)");

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("amount, currency, payment_method, reference_number, payment_date, invoices(invoice_number, clients(company_name))");

    const { data: reportsData } = await supabase
      .from("reports")
      .select("report_name, report_type, created_at, clients(company_name)");

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(clientsData || []),
      "Clients"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        (invoicesData || []).map((inv) => ({
          Invoice_No: inv.invoice_number,
          Client: inv.clients?.company_name || "-",
          Amount_Before_VAT: Number(inv.amount || 0),
          VAT_5: Number(inv.amount || 0) * 0.05,
          Total_AED: Number(inv.amount || 0) * 1.05,
          Currency: inv.currency || "AED",
          Status: inv.status,
          Date: inv.invoice_date,
        }))
      ),
      "Invoices"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        (paymentsData || []).map((p) => ({
          Invoice_No: p.invoices?.invoice_number || "-",
          Client: p.invoices?.clients?.company_name || "-",
          Amount: Number(p.amount || 0),
          Currency: p.currency || "AED",
          Method: p.payment_method || "-",
          Reference: p.reference_number || "-",
          Date: p.payment_date || "-",
        }))
      ),
      "Payments"
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        (reportsData || []).map((r) => ({
          Client: r.clients?.company_name || "-",
          Report_Name: r.report_name,
          Report_Type: r.report_type,
          Created_At: r.created_at,
        }))
      ),
      "Reports"
    );

    XLSX.writeFile(wb, "UnionCore_Full_Backup.xlsx");
  };

  useEffect(() => {
    fetchClients();
    fetchReports();
  }, []);

  const typeStyle = (type) => {
    if (type === "Financial Statement") return "bg-blue-100 text-blue-700";
    if (type === "VAT Report") return "bg-green-100 text-green-700";
    if (type === "Corporate Tax Report") return "bg-yellow-100 text-yellow-700";
    if (type === "Audit Report") return "bg-purple-100 text-purple-700";
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
          Reports & Exports
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage reports and export clients, invoices, payments, and backups.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={exportClients}
          className="rounded-xl bg-purple-600 px-5 py-3 font-medium text-white shadow-md transition hover:bg-purple-700"
        >
          Export Clients
        </button>

        <button onClick={exportInvoices} className={primaryButton}>
          Export Invoices
        </button>

        <button
          onClick={exportPayments}
          className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white shadow-md transition hover:bg-green-700"
        >
          Export Payments
        </button>

        <button
          onClick={exportFullBackup}
          className="rounded-xl bg-gradient-to-r from-gray-900 to-slate-700 px-5 py-3 font-medium text-white shadow-md transition hover:from-black hover:to-slate-800"
        >
          Export Full Backup
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Add Report
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

          <input
            placeholder="Report Name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className={inputStyle}
          />

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={inputStyle}
          >
            <option value="Financial Statement">Financial Statement</option>
            <option value="VAT Report">VAT Report</option>
            <option value="Corporate Tax Report">Corporate Tax Report</option>
            <option value="Audit Report">Audit Report</option>
          </select>

          <button onClick={addReport} className={primaryButton}>
            Add Report
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gradient-to-r from-gray-900 to-slate-800 text-white">
            <tr>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Report Name</th>
              <th className="px-5 py-4">Report Type</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-300"
                >
                  No reports found
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {report.clients?.company_name || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {report.report_name}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${typeStyle(
                        report.report_type
                      )}`}
                    >
                      {report.report_type}
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