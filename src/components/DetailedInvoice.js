import { jsPDF } from "jspdf";
import PrimeFinishLogo from "../images/PrimeFinishLogo.png"; // Adjust the path as necessary

// Currency formatting function
const formatCurrency = (num) => {
  const validNum = parseFloat(num) || 0;
  return "$" + validNum.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
};

export const generateDetailedInvoicePDF = (invoice) => {
  const doc = new jsPDF();

  const logoImage = new Image();
  logoImage.src = PrimeFinishLogo;

  logoImage.onload = () => {
    // Add the logo image
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
    doc.text("Invoice", 172, 20, null, null, "center");

    // Date and Invoice Number Box under the title
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${invoice.date || "N/A"}`, 157, 27);
    doc.text(`Invoice # ${invoice.estimateNumber || "N/A"}`, 157, 35);
    doc.line(155, 30, 195, 30); // Line between Date and Invoice Number
    doc.rect(155, 22, 40, 15); // Box around Date and Invoice Number

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

    // Render Grid Data (Items + Description + Total)
    let gridY = 117; // Starting Y position for the grid
    const gridBoxX = 15;
    const gridBoxY = 110; // Starting Y position for the grid box
    const gridBoxWidth = 180; // Fixed width for the grid
    const gridBoxHeight = 120; // Fixed height for the grid

    // Headers
    const headers = ["Items", "Description", "Total"];
    const headerX = [18, 43, 170]; // Positions for each header
    doc.setFontSize(10);
    doc.setFont("helvetica");

    headers.forEach((header, i) => {
      doc.text(header, headerX[i], gridY);
    });

    // Draw the grid box
    doc.rect(gridBoxX, gridBoxY, gridBoxWidth, gridBoxHeight);

    // Line below headers
    doc.line(15, gridY + 2, 195, gridY + 2);
    gridY += 10;

    // Vertical lines inside the grid
    const verticalLineX = 40; // Between "Items" and "Description"
    const verticalLineXRight = 168; // Before "Total"
    const verticalLineYStart = gridBoxY;
    const verticalLineYEnd = gridBoxY + gridBoxHeight;
    doc.line(
      verticalLineX,
      verticalLineYStart,
      verticalLineX,
      verticalLineYEnd
    );
    doc.line(
      verticalLineXRight,
      verticalLineYStart,
      verticalLineXRight,
      verticalLineYEnd
    ); // Before the Total column

    // Detailed Invoice Data (Rooms and Extras)
    const rooms = invoice.rooms || []; // Array of rooms
    const extras = invoice.extras || []; // Array of extras

    const allItems = [...rooms, ...extras]; // Combine rooms and extras into one array

    allItems.forEach((item) => {
      if (gridY + 5 <= gridBoxY + gridBoxHeight) {
        // If it's Square Footage, show "House" instead of "Room" in Items column
        const itemType =
          item.roomName === "Square Footage"
            ? "House"
            : item.roomName
            ? "Room"
            : "Extra/Paint";
        doc.text(itemType, headerX[0], gridY); // Items column

        // Handle the description (either room name or extra type)
        let description = item.roomName
          ? item.customRoomName || item.roomName // For rooms, show room name
          : item.customType || item.type; // For extras, show custom type or selected type

        // If it's an extra/paint and the user has selected "Other" and provided a custom type, split the custom type into lines
        if (!item.roomName && item.type === "Other" && item.customType) {
          const splitCustomType = doc.splitTextToSize(item.customType, 70); // Split custom type for "Other"
          splitCustomType.forEach((line) => {
            if (gridY + 5 <= gridBoxY + gridBoxHeight && line) {
              // Ensure line has a value and fits within the grid box
              doc.text(line, headerX[1], gridY); // Render the custom type on multiple lines
              gridY += 5; // Move down for each line
            }
          });
        } else if (description) {
          doc.text(description, headerX[1], gridY); // Description column for non-custom or normal items, if valid
        }

        // Set the total value (Square footage or price)
        if (item.roomName === "Square Footage") {
          const squareFootage = item.squareFootage || "N/A";
          doc.text(squareFootage.toString(), headerX[2], gridY); // Display entered square footage in Total column
        } else {
          const itemCost = item.cost
            ? formatCurrency(item.cost)
            : formatCurrency(0);
          doc.text(itemCost, headerX[2], gridY); // Total column for other rooms
        }

        gridY += 5; // Move to the next row
      }
    });

    // Render the description only once at the end of the grid
    const finalDescription =
      invoice.description === "Other"
        ? invoice.customDescription
        : invoice.description;

        gridY += 5; 
    // Split the description into lines if necessary
    const splitDescription = doc.splitTextToSize(finalDescription, 70); // Split description to fit in the column width

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
    doc.save(`Detailed_Invoice_${customerNameSanitized}.pdf`);
  };
};
