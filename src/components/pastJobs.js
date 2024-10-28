import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PastJobs = () => {
  const [closedJobs, setClosedJobs] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState([]); // State to track which jobs are visible
  const navigate = useNavigate();

  // Load closed jobs from localStorage on component mount
  useEffect(() => {
    const savedClosedJobs =
      JSON.parse(localStorage.getItem("closedJobs")) || [];
    setClosedJobs(savedClosedJobs);
  }, []);

  // Function to toggle job visibility
  const toggleJobVisibility = (jobIndex) => {
    if (visibleJobs.includes(jobIndex)) {
      setVisibleJobs(visibleJobs.filter((index) => index !== jobIndex));
    } else {
      setVisibleJobs([...visibleJobs, jobIndex]);
    }
  };

  // Function to delete a closed job
  const handleDelete = (jobIndex) => {
    const updatedJobs = closedJobs.filter((_, index) => index !== jobIndex);
    setClosedJobs(updatedJobs);
    localStorage.setItem("closedJobs", JSON.stringify(updatedJobs));
  };

  // Function to save the job as an invoice (preventing duplicates)
  const saveAsInvoice = (job) => {
    const savedInvoices = JSON.parse(localStorage.getItem("invoices")) || [];

    // Check if the invoice already exists (based on estimateNumber or another unique identifier)
    const isInvoiceCreated = savedInvoices.some(
      (invoice) => invoice.estimateNumber === job.estimateNumber
    );

    if (isInvoiceCreated) {
      alert("An invoice for this job has already been created.");
      return; // Stop if the invoice already exists
    }

    // Add the job as an invoice if it doesn't exist
    const defaultInvoiceDescription =
      "Thank you for your business! Payment due upon receipt.";

    // Modify the job's description for the invoice
    const invoice = {
      ...job,
      description: defaultInvoiceDescription, // Set the invoice-specific description
    };

    savedInvoices.push(invoice);
    localStorage.setItem("invoices", JSON.stringify(savedInvoices));
    alert("Invoice created successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Closed Jobs</h1>
        <button
          className="bg-green text-white p-2 rounded hover:bg-green-600"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </header>

      {closedJobs.length > 0 ? (
        closedJobs.map((job, jobIndex) => (
          <div
            key={jobIndex}
            className="mb-6 p-4 bg-gray-100 rounded-lg shadow"
          >
            <div className="flex justify-between mb-2 font-semibold text-gray-700">
              <span>Job #{job.estimateNumber}</span>
              <span>{job.customerName}</span>
              
              <button
                className="bg-darkBlue text-white p-2 rounded"
                onClick={() => toggleJobVisibility(jobIndex)}
              >
                {visibleJobs.includes(jobIndex) ? "Close" : "Open"}
              </button>
            </div>

            {/* Job details visible only when the "Open" button is clicked */}
            {visibleJobs.includes(jobIndex) && (
              <>
                <div className="mb-4">
                  <p>Address: {job.address}</p>
                  <p>Phone: {job.phoneNumber}</p>
                </div>

                {/* Display Room details */}
                <div className="mb-4">
                  <h3 className="font-semibold">Rooms</h3>
                  {job.rooms &&
                    job.rooms.map((room, roomIndex) => {
                      const isSquareFootage =
                        room.roomName === "Square Footage";
                      const squareFootagePrice =
                        job.costOptions?.find(
                          (option) => option.label === "Square Footage"
                        )?.value || 0; // Use the saved costOption for square footage

                      const roomCost = isSquareFootage
                        ? room.squareFootage * squareFootagePrice
                        : room.cost;

                      return (
                        <div key={roomIndex} className="mb-2">
                          <p>Room: {room.roomName}</p>
                          {isSquareFootage ? (
                            <>
                              <p>Square Footage: {room.squareFootage} sq ft</p>
                              <p>Cost: ${roomCost.toFixed(2)}</p>
                            </>
                          ) : (
                            <p>Cost: ${roomCost.toFixed(2)}</p>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Display Extra details */}
                {job.extras && job.extras.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold">Extras</h3>
                    {job.extras.map((extra, extraIndex) => (
                      <div key={extraIndex} className="mb-2">
                        <p>Extra: {extra.type}</p>
                        <p>Cost: ${extra.cost}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="section-bordered border-t mt-4 pt-4">
                  <div className="flex justify-between">
                    <p>Subtotal:</p>
                    <p>${job.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>GST/HST (13%):</p>
                    <p>${(job.subtotal * 0.13).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between font-bold">
                    <p>Total:</p>
                    <p>${(job.subtotal * 1.13).toFixed(2)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    className="bg-darkBlue text-white p-2 rounded"
                    onClick={() => saveAsInvoice(job)} // Save the job as an invoice
                  >
                    Create Invoice
                  </button>
                  <button
                    className="bg-pink text-white p-2 rounded"
                    onClick={() => handleDelete(jobIndex)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p>No closed jobs found</p>
      )}
    </div>
  );
};

export default PastJobs;
