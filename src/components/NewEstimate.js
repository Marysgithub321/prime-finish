import { jsPDF } from "jspdf"; // Import jsPDF to avoid no-undef error

// Load the image from the images folder
const loadImageFromURL = (url, callback) => {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; // use natural size to avoid blurriness
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    callback(dataURL);
  };
  img.src = url;
};

// The main function that generates the PDF
export const generateEstimatePDF = (estimate) => {
  const logoPath = "/images/LeapLogo1.png"; // Path to your logo image in the public folder

  loadImageFromURL(logoPath, (logoBase64) => {
    const doc = new jsPDF();

    // Add the logo to the PDF if it's loaded successfully
    if (logoBase64) {
      const imgProps = { x: 10, y: 5, width: 50, height: 30 };
      doc.addImage(
        logoBase64,
        "PNG",
        imgProps.x,
        imgProps.y,
        imgProps.width,
        imgProps.height
      );
    }

    // Continue generating PDF content
    generatePDFContent(doc, estimate);

    // Save the PDF
    doc.save(`Estimate_${estimate.jobNumber}.pdf`);
  });
};

// Function to handle the core PDF content
const generatePDFContent = (doc, estimate) => {
  doc.setFontSize(12);

  // Add content to PDF
  doc.text("Estimate Details", 10, 50); // Start the text below the logo
  doc.text(`Customer Name: ${estimate.customerName}`, 10, 60);
  doc.text(`Job Number: ${estimate.jobNumber}`, 10, 70);
  doc.text(`Date: ${estimate.date}`, 10, 80);
  doc.text(`Address: ${estimate.address}`, 10, 90);
  doc.text(`Phone Number: ${estimate.phoneNumber}`, 10, 100);

  // Add Room Details
  if (estimate.rooms && estimate.rooms.length > 0) {
    doc.text("Rooms:", 10, 110);
    estimate.rooms.forEach((room, i) => {
      doc.text(`${room.roomName}: $${room.cost}`, 20, 120 + i * 10);
    });
  }

  // Add Extras
  if (estimate.extras && estimate.extras.length > 0) {
    doc.text("Extras:", 10, 140);
    estimate.extras.forEach((extra, i) => {
      doc.text(`${extra.type}: $${extra.cost}`, 20, 150 + i * 10);
    });
  }

  // Add Paint Details
  if (estimate.paints && estimate.paints.length > 0) {
    doc.text("Paints:", 10, 170);
    estimate.paints.forEach((paint, i) => {
      doc.text(`${paint.type}: $${paint.cost}`, 20, 180 + i * 10);
    });
  }

  // Add Total Summary
  const yOffset = estimate.paints.length > 0 ? 200 : 170;
  doc.text(`Subtotal: $${estimate.subtotal.toFixed(2)}`, 10, yOffset);
  doc.text(`GST/HST: $${estimate.gstHst.toFixed(2)}`, 10, yOffset + 10);
  doc.text(`Total: $${estimate.total.toFixed(2)}`, 10, yOffset + 20);
};
