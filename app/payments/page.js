"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*, clients(company_name)");

    setInvoices(data || []);
  };

  const fetchPayments = async () => {
    const { data } = await supabase.from("payments").select("*");
    setPayments(data || []);
  };

  const addPayment = async () => {
    if (!invoiceId || !amount || Number(amount) <= 0) {
      alert("Select invoice and enter valid payment amount");
      return;
    }

    const invoice = invoices.find((inv) => inv.id === invoiceId);

    if (!invoice) {
      alert("Invoice not found");
      return;
    }

    const totalAlreadyPaid = payments
      .filter((p) => p.invoice_id === invoiceId)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const invoiceTotal = Number(invoice.amount) * 1.05;
    const paymentAmount = Number(amount);

    if (totalAlreadyPaid + paymentAmount > invoiceTotal + 0.01) {
      alert(
        `Payment exceeds remaining balance. Max allowed: ${(
          invoiceTotal - totalAlreadyPaid
        ).toFixed(2)} AED`
      );
      return;
    }

    const { error } = await supabase.from("payments").insert([
      {
        invoice_id: invoiceId,
        amount: paymentAmount,
        currency: "AED",
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        payment_date: paymentDate,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    const newTotalPaid = totalAlreadyPaid + paymentAmount;

    if (newTotalPaid >= invoiceTotal - 0.01) {
      await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", invoiceId);
    }

    setInvoiceId("");
    setAmount("");
    setPaymentMethod("Bank Transfer");
    setReferenceNumber("");
    setPaymentDate(new Date().toISOString().split("T")[0]);

    fetchInvoices();
    fetchPayments();
  };

  useEffect(() => {
    fetchInvoices();
    fetchPayments();
  }, []);

  const invoiceSummary = invoices.map((inv) => {
    const relatedPayments = payments.filter((p) => p.invoice_id === inv.id);
    const invoiceTotal = Number(inv.amount || 0) * 1.05;

    const totalPaid = relatedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    return {
      ...inv,
      invoiceTotal,
      totalPaid,
      remaining: Math.max(invoiceTotal - totalPaid, 0),
    };
  });

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
          Payment Tracking
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Payments
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Record payments, methods, references, and invoice balances.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Add Payment
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <select
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            className={`${inputStyle} md:col-span-2`}
          >
            <option value="">Select Invoice</option>
            {invoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoice_number || "Invoice"} -{" "}
                {inv.clients?.company_name || "-"} -{" "}
                {(Number(inv.amount || 0) * 1.05).toFixed(2)} AED
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Payment Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputStyle}
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className={inputStyle}
          >
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Card">Card</option>
            <option value="Other">Other</option>
          </select>

          <input
            placeholder="Reference No."
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className={inputStyle}
          />

          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className={inputStyle}
          />

          <button onClick={addPayment} className={`${primaryButton} md:col-span-6`}>
            Add Payment
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gradient-to-r from-gray-900 to-slate-800 text-white">
            <tr>
              <th className="px-5 py-4">Invoice</th>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Invoice Total</th>
              <th className="px-5 py-4">Total Paid</th>
              <th className="px-5 py-4">Remaining</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {invoiceSummary.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-gray-500 dark:text-gray-300">
                  No payment data found
                </td>
              </tr>
            ) : (
              invoiceSummary.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {inv.invoice_number || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {inv.clients?.company_name || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {inv.invoiceTotal.toFixed(2)} AED
                  </td>
                  <td className="px-5 py-4 font-semibold text-green-600">
                    {inv.totalPaid.toFixed(2)} AED
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${
                      inv.remaining <= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {inv.remaining.toFixed(2)} AED
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyle(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 px-5 py-4 text-white">
          <h2 className="text-lg font-semibold">Payment History</h2>
        </div>

        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-5 py-4">Invoice</th>
              <th className="px-5 py-4">Client</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Method</th>
              <th className="px-5 py-4">Reference</th>
              <th className="px-5 py-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-8 text-center text-gray-500 dark:text-gray-300">
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const invoice = invoices.find(
                  (inv) => inv.id === payment.invoice_id
                );

                return (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                      {invoice?.invoice_number || "-"}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {invoice?.clients?.company_name || "-"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-green-600">
                      {Number(payment.amount).toFixed(2)} AED
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {payment.payment_method || "-"}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {payment.reference_number || "-"}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {new Date(payment.payment_date).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}