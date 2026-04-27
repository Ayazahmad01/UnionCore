"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [trn, setTrn] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setClients(data || []);
  };

  const clearForm = () => {
    setCompanyName("");
    setEmail("");
    setPhone("");
    setTrn("");
    setAddress("");
    setEditingId(null);
  };

  const addClient = async () => {
    if (!companyName) {
      alert("Company name is required");
      return;
    }

    const { error } = await supabase.from("clients").insert([
      {
        company_name: companyName,
        email,
        phone,
        trn,
        address,
        status: "active",
      },
    ]);

    if (error) alert(error.message);
    else {
      clearForm();
      fetchClients();
    }
  };

  const deactivateClient = async (id) => {
    const { error } = await supabase
      .from("clients")
      .update({ status: "inactive" })
      .eq("id", id);

    if (error) alert(error.message);
    else fetchClients();
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setCompanyName(client.company_name || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setTrn(client.trn || "");
    setAddress(client.address || "");
  };

  const updateClient = async () => {
    if (!companyName) {
      alert("Company name is required");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .update({
        company_name: companyName,
        email,
        phone,
        trn,
        address,
      })
      .eq("id", editingId);

    if (error) alert(error.message);
    else {
      clearForm();
      fetchClients();
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.phone?.toLowerCase().includes(search.toLowerCase()) ||
      client.trn?.toLowerCase().includes(search.toLowerCase()) ||
      client.address?.toLowerCase().includes(search.toLowerCase()) ||
      client.status?.toLowerCase().includes(search.toLowerCase())
  );

  const primaryButton =
    "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 font-medium text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg";

  const inputStyle =
    "rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-900";

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 p-8 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          Client Management
        </p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Clients
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage UnionCore client details, TRN, contact info, and address.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          placeholder="Search clients..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={`${inputStyle} w-80`}
        />

        <button onClick={() => setSearch(searchInput)} className={primaryButton}>
          Search
        </button>

        <button
          onClick={() => {
            setSearchInput("");
            setSearch("");
          }}
          className="rounded-xl bg-white/80 px-5 py-2 font-medium text-gray-700 shadow-md transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {editingId ? "Edit Client" : "Add New Client"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputStyle}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputStyle}
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputStyle}
          />

          <input
            placeholder="TRN"
            value={trn}
            onChange={(e) => setTrn(e.target.value)}
            className={inputStyle}
          />

          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`${inputStyle} md:col-span-2`}
          />

          {editingId ? (
            <div className="flex gap-2">
              <button
                onClick={updateClient}
                className="rounded-xl bg-green-600 px-5 py-2 font-medium text-white shadow-md transition hover:bg-green-700"
              >
                Save
              </button>

              <button
                onClick={clearForm}
                className="rounded-xl bg-gray-200 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={addClient} className={primaryButton}>
              Add Client
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-800/80">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gradient-to-r from-gray-900 to-slate-800 text-white">
            <tr>
              <th className="px-5 py-4">Company</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">TRN</th>
              <th className="px-5 py-4">Address</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-8 text-center text-gray-500 dark:text-gray-300"
                >
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {client.company_name}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {client.email || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {client.phone || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {client.trn || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                    {client.address || "-"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        client.status === "inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {client.status || "active"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => startEdit(client)}
                      className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-amber-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deactivateClient(client.id)}
                      disabled={client.status === "inactive"}
                      className="ml-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Deactivate
                    </button>
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