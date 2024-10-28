import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const StaffPayouts = () => {
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    date: "",
    name: "",
    description: "",
    amount: "",
    gst: false,
  });
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const navigate = useNavigate();

  // Load payments from localStorage when the component mounts
  useEffect(() => {
    const savedPayments = localStorage.getItem("staffPayments");
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Save payments to localStorage whenever they change
  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem("staffPayments", JSON.stringify(payments));
    }
  }, [payments]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add payment
  const addPayment = () => {
    const newPayment = {
      ...paymentForm,
      amount: parseFloat(paymentForm.amount),
      total: paymentForm.gst
        ? parseFloat(paymentForm.amount) * 1.13
        : parseFloat(paymentForm.amount),
    };
    setPayments([...payments, newPayment]);
    setShowForm(false);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setPaymentForm({
      date: "",
      name: "",
      description: "",
      amount: "",
      gst: false,
    });
  };

  // Edit payment
  const editPayment = (index) => {
    const paymentToEdit = payments[index];
    setPaymentForm(paymentToEdit);
    deletePayment(index);
    setShowForm(true);
  };

  // Delete payment
const deletePayment = (index) => {
  const updatedPayments = payments.filter((_, i) => i !== index);
  setPayments(updatedPayments);
  localStorage.setItem("staffPayments", JSON.stringify(updatedPayments));
};

  // Filter payments by name and date
  const filteredPayments = payments.filter((payment) => {
    const matchesName = payment.name
      .toLowerCase()
      .includes(filterName.toLowerCase());
    const matchesDate =
      filterDate === "" ||
      new Date(payment.date).getFullYear() === parseInt(filterDate, 10);

    return matchesName && matchesDate;
  });

  // Generate PDF
  const handlePrintPayouts = () => {
    const doc = new jsPDF();
    doc.setFontSize(10);
    doc.text("Payouts Report", 10, 10);

    filteredPayments.forEach((payment, index) => {
      const line = `${payment.date} | ${payment.name} | ${
        payment.description
      } | $${payment.total.toFixed(2)} | ${payment.gst ? "GST" : "No GST"}`;
      doc.text(line, 10, 20 + index * 10);
    });

    const fileName = filterName ? `${filterName}_payout.pdf` : "staff_payouts.pdf";
    doc.save(fileName);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Header with Home and Add Payment buttons */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Payouts</h1>
        <button
          className="bg-green text-white p-2 rounded"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </header>

      {/* Filter Section */}
      <div className="mb-4">
        <label htmlFor="filterName" className="block font-bold mb-2">
          Filter by Name:
        </label>
        <input
          type="text"
          id="filterName"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter contractor name..."
          autoComplete="off"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="filterDate" className="block font-bold mb-2">
          Filter by Year:
        </label>
        <input
          type="number"
          id="filterDate"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter year..."
          autoComplete="off"
        />
      </div>

      {/* Print Button */}
      <button
        className="bg-darkBlue text-white p-2 rounded mb-4 mr-4"
        onClick={handlePrintPayouts}
      >
        Print List
      </button>

      {/* Add Payment button */}
      <button
        className="bg-blue text-white p-2 rounded mb-4"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Add Payment"}
      </button>

      {/* Payment Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="date" className="block font-bold mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={paymentForm.date}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={paymentForm.name}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              autoComplete="name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block font-bold mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={paymentForm.description}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block font-bold mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={paymentForm.amount}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-2">
              <input
                type="checkbox"
                id="gst"
                name="gst"
                checked={paymentForm.gst}
                onChange={handleChange}
                className="mr-2"
              />
              Includes GST?
            </label>
          </div>
          <button
            className="bg-darkBlue text-white p-2 rounded"
            onClick={addPayment}
          >
            Add Payment
          </button>
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white p-4 rounded-lg shadow">
        {filteredPayments.length > 0 ? (
          filteredPayments.map((payment, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
              <div className="flex justify-between">
                <span>{payment.date}</span>
                <span>{payment.name}</span>
                <span>${payment.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{payment.description}</span>
                <div className="flex space-x-4">
                  <button
                    className="bg-tealLight text-white p-2 rounded"
                    onClick={() => editPayment(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-pink text-white p-2 rounded"
                    onClick={() => deletePayment(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No payments found.</p>
        )}
      </div>
    </div>
  );
};

export default StaffPayouts;
