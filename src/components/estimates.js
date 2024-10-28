import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { generateDetailedPDF } from "./DetailedEstimate"; // Import the detailed estimate function
import PrimeFinishLogo from "../images/PrimeFinishLogo.png"; // Adjust the path to your actual image location

const Estimates = () => {
  const [estimates, setEstimates] = useState([]);
  const navigate = useNavigate();

  // Load saved estimates from localStorage
  useEffect(() => {
    const savedEstimates = JSON.parse(localStorage.getItem("estimates")) || [];
    setEstimates(savedEstimates);
  }, []);

  // Function to delete an estimate
  const deleteEstimate = (index) => {
    const updatedEstimates = estimates.filter((_, i) => i !== index);
    setEstimates(updatedEstimates);
    localStorage.setItem("estimates", JSON.stringify(updatedEstimates));
  };

  // Function to open a job (move estimate to openJobs)
  const openJob = (estimate) => {
    const openJobs = JSON.parse(localStorage.getItem("openJobs")) || [];
    
    // Check if the job is already open
    const isJobOpen = openJobs.some(job => job.estimateNumber === estimate.estimateNumber);
    if (isJobOpen) {
      alert("This job is already open.");
      return;
    }

    openJobs.push(estimate);
    localStorage.setItem("openJobs", JSON.stringify(openJobs));
    alert(`Job ${estimate.estimateNumber} opened.`);
  };

  // Function to close a job (move estimate to closedJobs)
  const closeJob = (estimate) => {
    const closedJobs = JSON.parse(localStorage.getItem("closedJobs")) || [];
    const openJobs = JSON.parse(localStorage.getItem("openJobs")) || [];

    // Check if the job is already closed
    const isJobClosed = closedJobs.some(job => job.estimateNumber === estimate.estimateNumber);
    if (isJobClosed) {
      alert("This job is already closed.");
      return;
    }

    // Move job to closedJobs
    closedJobs.push(estimate);
    localStorage.setItem("closedJobs", JSON.stringify(closedJobs));

    // Remove job from openJobs if it exists
    const updatedOpenJobs = openJobs.filter(job => job.estimateNumber !== estimate.estimateNumber);
    localStorage.setItem("openJobs", JSON.stringify(updatedOpenJobs));
    
    alert(`Job ${estimate.estimateNumber} closed.`);
  };

  // Function to format currency
  const formatCurrency = (num) =>
    "$" + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");

  // PDF Generation Function
  const generatePDF = (estimate) => {
    const doc = new jsPDF();

    // Load the logo image and wait for it to load before proceeding
    const logoImage = new Image();
    logoImage.src = PrimeFinishLogo;

    logoImage.onload = () => {
      // Add the logo image at specified position
      const imgProps = { x: 18, y: 10, width: 100, height: 50 };
      doc.addImage(
        logoImage,
        "PNG",
        imgProps.x,
        imgProps.y,
        imgProps.width,
        imgProps.height
      );

      // Company Information Box
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const companyInfo = [
        "Prime Finish Painting",
        "(416) 123-4567",
        "123 Maple Avenue",
        "Toronto, ON M4B 1B4",
        "info@primefinish.ca",
      ];
      const companyInfoX = 47;
      const companyInfoYStart = 75;
      const companyLineHeight = 5;

      companyInfo.forEach((line, idx) => {
        doc.text(
          line,
          companyInfoX,
          companyInfoYStart + idx * companyLineHeight
        );
      });
      const boxWidth = 50;
      const boxHeight = companyInfo.length * companyLineHeight + 3;
      doc.rect(45, 70, boxWidth, boxHeight);

      // Title (Estimate)
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Estimate", 170, 20, null, null, "center");

      // Date and Estimate Number Box under the title
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${estimate.date || "N/A"}`, 157, 27);
      doc.text(`Estimate # ${estimate.estimateNumber || "N/A"}`, 157, 35);

      // Line between Date and Estimate Number
      doc.line(155, 30, 195, 30);
      // Box around Date and Estimate Number
      doc.rect(155, 22, 40, 15);

      // Customer Information
      const customerInfoLabel = "Name / Address:";
      const customerName = estimate.customerName || "N/A";
      const phoneNumber = estimate.phoneNumber || "N/A";
      const address = estimate.address || "N/A";
      const addressLines = doc.splitTextToSize(address, 70);

      doc.text(customerInfoLabel, 120, 75);
      doc.line(118, 78, 195, 78);
      doc.text(customerName, 120, 83);
      let addressY = 88;
      addressLines.forEach((line) => {
        doc.text(line, 120, addressY);
        addressY += 5;
      });
      doc.text(phoneNumber, 120, addressY + 0);

      const customerBoxHeight = addressY - 70 + 5;
      doc.rect(118, 70, 77, customerBoxHeight);

      let gridY = 117; // Fixed starting Y position for the grid

      // Headers
      const headers = ["Items", "Description"];
      const headerX = [18, 43];
      doc.setFontSize(10);
      doc.setFont("helvetica");

      // Render Headers
      headers.forEach((header, i) => {
        doc.text(header, headerX[i], gridY);
      });

      // Draw a box around the grid (Fixed Size)
      const gridBoxX = 15;
      const gridBoxY = 110; // Starting Y position for the grid box
      const gridBoxWidth = 180; // Fixed width
      const gridBoxHeight = 120; // Fixed height
      doc.rect(gridBoxX, gridBoxY, gridBoxWidth, gridBoxHeight); // Removed the -5 offset for alignment

      // Line below headers
      doc.line(15, gridY + 2, 195, gridY + 2);
      gridY += 10;

      // Add a vertical line inside the grid
      const verticalLineX = 40; // X position for the vertical line
      const verticalLineYStart = gridBoxY; // Start at the top of the grid
      const verticalLineYEnd = gridBoxY + gridBoxHeight; // End at the bottom of the grid
      doc.line(verticalLineX, verticalLineYStart, verticalLineX, verticalLineYEnd); // Draw the vertical line

      // Render the grid data (Description)
      const finalDescription =
        estimate.description === "Other"
          ? estimate.customDescription
          : estimate.description;

      // Split the description into multiple lines with a maximum of 50 characters per line
      const maxLineWidth = 70; // Adjust this value based on how many characters per line you want
      const splitDescription = doc.splitTextToSize(finalDescription, maxLineWidth); // Split the description

      splitDescription.forEach((row, i) => {
        if (gridY + 5 <= gridBoxY + gridBoxHeight) {
          // Ensure text stays within the grid box
          if (row) {
            doc.text(row, headerX[1], gridY); // Render the row if it's not null/undefined
          }
          gridY += 5; // Increase the Y position for each row
        }
      });

      // Totals Box (Fixed Position 15 units below the grid)
      const totalsBoxX = 150;
      const totalsBoxY = gridBoxY + gridBoxHeight + 5; // 15 units below the grid box
      const totalsBoxWidth = 45;
      const totalsBoxHeight = 30;
      const totalsLineHeight = 10;

      // Draw the box for totals
      doc.rect(totalsBoxX, totalsBoxY, totalsBoxWidth, totalsBoxHeight);

      doc.setFont("helvetica", "bold");
      doc.text("Subtotal:", totalsBoxX + 2, totalsBoxY + totalsLineHeight - 2);
      doc.text(
        "GST/HST:",
        totalsBoxX + 2,
        totalsBoxY + totalsLineHeight * 2 - 2
      );
      doc.text("Total:", totalsBoxX + 2, totalsBoxY + totalsLineHeight * 3 - 2);

      // Add lines between the subtotal, GST/HST, and total
      doc.line(
        totalsBoxX,
        totalsBoxY + totalsLineHeight,
        totalsBoxX + totalsBoxWidth,
        totalsBoxY + totalsLineHeight
      );
      doc.line(
        totalsBoxX,
        totalsBoxY + totalsLineHeight * 2,
        totalsBoxX + totalsBoxWidth,
        totalsBoxY + totalsLineHeight * 2
      );
      doc.line(
        totalsBoxX,
        totalsBoxY + totalsLineHeight * 3,
        totalsBoxX + totalsBoxWidth,
        totalsBoxY + totalsLineHeight * 3
      );

      doc.setFont("helvetica", "normal");

      const subtotal = parseFloat(estimate.subtotal || 0);
      const taxAmount = subtotal * 0.13;
      const totalValue = subtotal + taxAmount;

      doc.text(
        formatCurrency(subtotal),
        totalsBoxX + totalsBoxWidth - 2,
        totalsBoxY + totalsLineHeight - 2,
        { align: "right" }
      );
      doc.text(
        formatCurrency(taxAmount),
        totalsBoxX + totalsBoxWidth - 2,
        totalsBoxY + totalsLineHeight * 2 - 2,
        { align: "right" }
      );
      doc.text(
        formatCurrency(totalValue),
        totalsBoxX + totalsBoxWidth - 2,
        totalsBoxY + totalsLineHeight * 3 - 2,
        { align: "right" }
      );

      // GST/HST Number (Positioned 15 units below the grid box, aligned to the left)
      const gstNumberY = gridBoxY + gridBoxHeight + 15; // 15 units below the grid box
      doc.setFont("helvetica", "normal");
      doc.text("GST/HST NO.:", 15, gstNumberY); // Align to the left
      doc.text("12345 6789 RT0001", 50, gstNumberY); // GST/HST number aligned next to the label

      // Save the PDF with the customer's name
      const customerNameSanitized = estimate.customerName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      doc.save(`Estimate_${customerNameSanitized}.pdf`);
    };
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Header with Home Button */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estimates</h1>
        <button
          className="bg-green text-white p-2 rounded hover:bg-green-600"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </header>

      {/* Display saved estimates */}
      {estimates.length > 0 ? (
        estimates.map((estimate, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
            <p>{`Date: ${estimate.date} | Estimate Number: ${estimate.estimateNumber}`}</p>
            <p>{`Customer Name: ${estimate.customerName || "N/A"}`}</p>
            <p>{`Phone Number: ${estimate.phoneNumber || "N/A"}`}</p>
            <p>{`Address: ${estimate.address || "N/A"}`}</p>
            <p>{`Total: ${estimate.total || "N/A"}`}</p>

            {/* Button Container with Flexbox */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                className="bg-tealLight text-white p-2 rounded w-full sm:w-auto"
                onClick={() => generatePDF(estimate)}
              >
                Estimate
              </button>

              <button
                className="bg-darkBlue text-white p-2 rounded w-full sm:w-auto"
                onClick={() => generateDetailedPDF(estimate)}
              >
                Detailed Estimate
              </button>

              <button
                className="bg-blue text-white p-2 rounded w-full sm:w-auto"
                onClick={() =>
                  navigate("/estimate-calculator", { state: { estimate } })
                }
              >
                Edit
              </button>

              <button
                className="bg-tealLight text-white p-2 rounded w-full sm:w-auto"
                onClick={() => openJob(estimate)}
              >
                Open Job
              </button>

              <button
                className="bg-darkBlue text-white p-2 rounded w-full sm:w-auto"
                onClick={() => closeJob(estimate)}
              >
                Close Job
              </button>

              <button
                className="bg-pink text-white p-2 rounded w-full sm:w-auto"
                onClick={() => deleteEstimate(index)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No estimates found.</p>
      )}
    </div>
  );
};

export default Estimates;
