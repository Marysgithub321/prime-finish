import { jsPDF } from "jspdf";
import PrimeFinishLogo from "../images/PrimeFinishLogo.png"; // Adjust the path as necessary

// Currency formatting function
const formatCurrency = (num) => {
  const validNum = parseFloat(num) || 0; // Parse the number or fallback to 0 if invalid
  return "$" + validNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

// PDF Generation Function for Basic Invoice
export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();

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
      doc.text(line, companyInfoX, companyInfoYStart + idx * companyLineHeight);
    });
    const boxWidth = 50;
    const boxHeight = companyInfo.length * companyLineHeight + 3;
    doc.rect(45, 70, boxWidth, boxHeight);

    // Title (Invoice)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", 170, 20, null, null, "center");

    // Date and Invoice Number Box under the title
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${invoice.date || "N/A"}`, 157, 27);
    doc.text(`Invoice # ${invoice.estimateNumber || "N/A"}`, 157, 35);

    // Line between Date and Invoice Number
    doc.line(155, 30, 195, 30);
    // Box around Date and Invoice Number
    doc.rect(155, 22, 40, 15);

    // Customer Information
    const customerInfoLabel = "Name / Address:";
    const customerName = invoice.customerName || "N/A";
    const phoneNumber = invoice.phoneNumber || "N/A";
    const address = invoice.address || "N/A";
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
    doc.rect(gridBoxX, gridBoxY, gridBoxWidth, gridBoxHeight);

    // Line below headers
    doc.line(15, gridY + 2, 195, gridY + 2);
    gridY += 10;

    // Add a vertical line inside the grid
    const verticalLineX = 40; // X position for the vertical line
    const verticalLineYStart = gridBoxY; // Start at the top of the grid
    const verticalLineYEnd = gridBoxY + gridBoxHeight; // End at the bottom of the grid
    doc.line(
      verticalLineX,
      verticalLineYStart,
      verticalLineX,
      verticalLineYEnd
    ); // Draw the vertical line

    // Render the grid data (Description)
    const finalDescription =
      invoice.description === "Other"
        ? invoice.customDescription
        : invoice.description;

    // Split the description into multiple lines with a maximum of 50 characters per line
    const maxLineWidth = 70;
    const splitDescription = doc.splitTextToSize(
      finalDescription,
      maxLineWidth
    ); // Split the description

    splitDescription.forEach((row) => {
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
    doc.text("GST/HST:", totalsBoxX + 2, totalsBoxY + totalsLineHeight * 2 - 2);
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

    const subtotal = parseFloat(invoice.subtotal || 0);
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
    const customerNameSanitized = invoice.customerName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    doc.save(`Invoice_${customerNameSanitized}.pdf`);
  };
};
