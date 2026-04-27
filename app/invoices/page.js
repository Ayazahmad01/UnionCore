"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoicesPage() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoBase64, setLogoBase64] = useState("");
  const [pdfLoading, setPdfLoading] = useState(null);

  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("unpaid");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filterStatus, setFilterStatus] = useState("all");

  const COMPANY_TRN = "100123456700003";

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*");
    setClients(data || []);
  };

  const fetchInvoices = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("invoices")
      .select("*, clients(company_name, trn, address)")
      .order("invoice_date", { ascending: false });

    setInvoices(data || []);
    setLoading(false);
  };

  const getLogoBase64 = async () => {
    const response = await fetch("/logo.png");
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.filter((inv) =>
      inv.invoice_number?.includes(`UC-${year}`)
    ).length;

    return `UC-${year}-${String(count + 1).padStart(3, "0")}`;
  };

  const addInvoice = async () => {
    if (!clientId || !amount || Number(amount) <= 0) {
      alert("Select client and enter valid amount");
      return;
    }

    const { error } = await supabase.from("invoices").insert([
      {
        client_id: clientId,
        amount: Number(amount),
        currency: "AED",
        status,
        invoice_number: generateInvoiceNumber(),
        invoice_date: invoiceDate,
      },
    ]);

    if (error) alert(error.message);
    else {
      setClientId("");
      setAmount("");
      setStatus("unpaid");
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      fetchInvoices();
    }
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) alert(error.message);
    else fetchInvoices();
  };

  const cancelInvoice = async (id) => {
    if (!confirm("Cancel this invoice?")) return;
    updateStatus(id, "cancelled");
  };

  const downloadInvoicePDF = async (invoice) => {
    setPdfLoading(invoice.id);

    const doc = new jsPDF();
    const taxableAmount = Number(invoice.amount || 0);
    const vatAmount = taxableAmount * 0.05;
    const totalAmount = taxableAmount + vatAmount;
    const currency = invoice.currency || "AED";
    const clientName = invoice.clients?.company_name || "-";

    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 14, 10, 55, 22);
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175);
    doc.text("TAX INVOICE", 196, 20, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Invoice No: ${invoice.invoice_number || "-"}`, 196, 32, {
      align: "right",
    });
    doc.text(
      `Date: ${new Date(invoice.invoice_date).toLocaleDateString("en-GB")}`,
      196,
      38,
      { align: "right" }
    );
    doc.text(`Status: ${invoice.status?.toUpperCase()}`, 196, 44, {
      align: "right",
    });
    doc.text(`Currency: ${currency}`, 196, 50, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("UnionCore Accounting & Advisory Services", 14, 42);
    doc.text("Dubai, United Arab Emirates", 14, 48);
    doc.text("Email: info@unioncore.ae", 14, 54);
    doc.text(`TRN: ${COMPANY_TRN}`, 14, 60);

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.6);
    doc.line(14, 68, 196, 68);

    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(14, 76, 182, 34, 3, 3, "FD");

    doc.setFontSize(11);
    doc.setTextColor(30, 64, 175);
    doc.text("BILL TO", 20, 86);

    doc.setFontSize(10);
    doc.setTextColor(45, 45, 45);
    doc.text(clientName.toUpperCase(), 20, 94);
    doc.text(`TRN: ${invoice.clients?.trn || "N/A"}`, 20, 101);
    doc.text(`Address: ${invoice.clients?.address || "N/A"}`, 20, 108);

    autoTable(doc, {
      startY: 122,
      head: [["Description", "Amount"]],
      body: [
        ["Accounting / Tax Services", `${taxableAmount.toFixed(2)} ${currency}`],
        ["VAT 5%", `${vatAmount.toFixed(2)} ${currency}`],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: { 1: { halign: "right" } },
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    doc.setFillColor(30, 64, 175);
    doc.roundedRect(126, finalY, 70, 16, 3, 3, "F");

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 132, finalY + 10);
    doc.text(`${totalAmount.toFixed(2)} ${currency}`, 190, finalY + 10, {
      align: "right",
    });
    doc.setFont("helvetica", "normal");

    doc.setFontSize(40);
    doc.setTextColor(235, 235, 235);
    doc.text("UNIONCORE", 105, 165, { align: "center", angle: 45 });

    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text("Notes:", 14, finalY + 30);
    doc.text(
      "Thank you for choosing UnionCore — Where Finance Meets Trust.",
      14,
      finalY + 38
    );

    doc.text("Payment Terms:", 14, finalY + 52);
    doc.text("Due upon receipt.", 14, finalY + 60);

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 280, 196, 280);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by UnionCore Accounting System", 105, 287, {
      align: "center",
    });

    const safeClientName = (invoice.clients?.company_name || "client")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();

    doc.save(
      `UnionCore-${invoice.invoice_number || "Invoice"}-${safeClientName}.pdf`
    );

    setPdfLoading(null);
  };

  useEffect(() => {
    fetchClients();
    fetchInvoices();
    getLogoBase64().then(setLogoBase64);
  }, []);

  const filteredInvoices =
    filterStatus === "all"
      ? invoices
      : invoices.filter((invoice) => invoice.status === filterStatus);

  const totalFiltered = filteredInvoices
    .filter((i) => i.status !== "cancelled")
    .reduce((sum, inv) => sum + Number(inv.amount) * 1.05, 0);

  const statusStyle = (status) => {
    if (status === "paid") return "bg-green-100 text-green-700";
    if (status === "unpaid") return "bg-red-100 text-red-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "cancelled") return "bg-gray-200 text-gray-700";
    return "bg-blue-100 text-blue-700";
  };

  const inputStyle =
    "rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900";

  const primaryButton =
    "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-medium text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg";

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-8 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Invoice Management
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Invoices
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Create, manage, track, and download professional VAT invoices.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={inputStyle}
        >
          <option value="all">All Invoices</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="rounded-2xl border border-white/40 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Filtered Total
          </p>
          <p className="text-xl font-bold text-blue-600">
            {totalFiltered.toFixed(2)} AED
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Add New Invoice
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
            type="number"
            placeholder="Amount before VAT"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputStyle}
          />

          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className={inputStyle}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputStyle}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          <button onClick={addInvoice} className={primaryButton}>
            Add Invoice
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gradient-to-r from-gray-900 to-slate-800 text-white">
            <tr>
              <th className="px-5 py-4">Invoice No</th>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Total AED</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-300"
                >
                  Loading...
                </td>
              </tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-300"
                >
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {invoice.clients?.company_name || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {(Number(invoice.amount) * 1.05).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyle(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {invoice.status !== "paid" &&
                        invoice.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatus(invoice.id, "paid")}
                            className="rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-green-700"
                          >
                            Mark Paid
                          </button>
                        )}

                      {invoice.status !== "cancelled" && (
                        <button
                          onClick={() => cancelInvoice(invoice.id)}
                          className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => downloadInvoicePDF(invoice)}
                        disabled={pdfLoading === invoice.id}
                        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {pdfLoading === invoice.id ? "..." : "PDF"}
                      </button>
                    </div>
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