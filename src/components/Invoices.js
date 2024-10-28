import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateInvoicePDF } from './InvoicePdf';
import { generateDetailedInvoicePDF } from './DetailedInvoice';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  // Load saved invoices from localStorage
  useEffect(() => {
    const savedInvoices = JSON.parse(localStorage.getItem("invoices")) || [];
    // Ensure all totals and gstHst are numbers when loaded
    const formattedInvoices = savedInvoices.map(invoice => ({
      ...invoice,
      total: Number(invoice.total || 0),
      gstHst: Number(invoice.gstHst || 0),
    }));
    setInvoices(formattedInvoices);
  }, []);

  // Function to delete an invoice
  const deleteInvoice = (index) => {
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          className="bg-green text-white p-2 rounded hover:bg-green-600"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </header>

      {invoices.length > 0 ? (
        invoices.map((invoice, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
            <p>{`Date: ${invoice.date || "N/A"} | Invoice Number: ${invoice.estimateNumber || "N/A"}`}</p>
            <p>{`Customer Name: ${invoice.customerName || "N/A"}`}</p>
            <p>{`Phone Number: ${invoice.phoneNumber || "N/A"}`}</p>
            <p>{`Address: ${invoice.address || "N/A"}`}</p>
            <p>{`Total: $${Number(invoice.total).toFixed(2)}`}</p>

            <div className="flex space-x-4">
              <button
                className="bg-darkBlue text-white p-2 mt-4 rounded"
                onClick={() => generateInvoicePDF(invoice)}
              >
                Invoice
              </button>
              <button
                className="bg-blue text-white p-2 mt-4 rounded"
                onClick={() => generateDetailedInvoicePDF(invoice)}
              >
                Detailed Invoice
              </button>
              <button
                className="bg-tealLight text-white p-2 mt-4 rounded"
                onClick={() => {
                  const formattedInvoice = {
                    ...invoice,
                    total: Number(invoice.total || 0),
                    gstHst: Number(invoice.gstHst || 0),
                  };
                  navigate("/new-invoice", { state: { job: formattedInvoice } });
                }}
              >
                Edit
              </button>
              <button
                className="bg-pink text-white p-2 mt-4 rounded"
                onClick={() => deleteInvoice(index)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No invoices found.</p>
      )}
    </div>
  );
};

export default Invoices;
