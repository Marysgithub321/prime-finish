import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getNextAvailableNumber } from "../utils";

const NewInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Default cost options
  const defaultCostOptions = [
    { label: "Square Footage", value: 3 },
    { label: "8ft ceiling walls trim and doors", value: 350 },
    { label: "9ft ceiling walls trim and doors", value: 400 },
    { label: "10ft ceiling walls trim and doors", value: 450 },
    { label: "Vaulted ceiling", value: 600 },
    { label: "8ft walls and ceilings", value: 275 },
    { label: "9ft walls and ceilings", value: 325 },
    { label: "10ft walls and ceilings", value: 385 },
    { label: "8ft walls", value: 225 },
    { label: "9ft walls", value: 275 },
    { label: "10ft walls", value: 325 },
    { label: "Just ceiling", value: 150 },
    { label: "Just trim and doors", value: 125 },
    { label: "Painting Stairs", value: 125 },
    { label: "Staining Stairs", value: 500 },
    { label: "Matching Stain to floor", value: 600 },
    { label: "Staining Beam", value: 250 },
    { label: "Painting Railing", value: 450 },
    { label: "Staining Railing", value: 550 },
    { label: "Other", value: 50 },
  ];

  // State initialization
  const [costOptions, setCostOptions] = useState(() => {
    const savedCostOptions =
      JSON.parse(localStorage.getItem("invoiceCostOptions")) || [];
    const mergedOptions = [...defaultCostOptions];

    // Merge saved options with default options
    savedCostOptions.forEach((savedOption) => {
      const index = mergedOptions.findIndex(
        (opt) => opt.label === savedOption.label
      );
      if (index !== -1) {
        mergedOptions[index].value = savedOption.value;
      } else {
        mergedOptions.push(savedOption);
      }
    });

    return mergedOptions;
  });

  // Room and extra options
  const roomOptions = [
    "Square Footage",
    "Front Entry",
    "Living Room",
    "Kitchen",
    "Dining Room",
    "Hall",
    "Master Bedroom",
    "Master Bath",
    "Walk-in closet",
    "Bedroom 2",
    "Bedroom 3",
    "Main Bath",
    "Office",
    "Nursery",
    "Stairway",
    "Play Room",
    "Laundry Room",
    "Rec Room",
    "Bedroom 4",
    "Bedroom 5",
    "Downstairs Bath",
    "Upstairs Bath",
    "Half Bath",
    "Garage",
    "Beam",
    "Railing",
    "Extra Room",
    "Stairs",
    "Sun Room",
    "Closet",
  ];

  const extraOptions = ["Paint", "Stain", "Primer", "Travel", "Other"];

  // Initialize form state
  const [customerName, setCustomerName] = useState(
    location.state?.job?.customerName || ""
  );
  const [estimateNumber, setEstimateNumber] = useState(
    location.state?.job?.estimateNumber || ""
  );
  const [date, setDate] = useState(location.state?.job?.date || "");
  const [address, setAddress] = useState(location.state?.job?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(
    location.state?.job?.phoneNumber || ""
  );
  const [rooms, setRooms] = useState(location.state?.job?.rooms || []);
  const [extras, setExtras] = useState(location.state?.job?.extras || []);
  const [total, setTotal] = useState(0);
  const [gstHst, setGstHst] = useState(0);
  const [editPrices, setEditPrices] = useState(false);
  const [description, setDescription] = useState(
    location.state?.job?.description || ""
  );
  const [customDescription, setCustomDescription] = useState(
    location.state?.job?.customDescription || ""
  );

  // Auto-generate the next invoice number if not editing
  useEffect(() => {
    if (!estimateNumber) {
      const estimates = JSON.parse(localStorage.getItem("estimates")) || [];
      const openJobs = JSON.parse(localStorage.getItem("openJobs")) || [];
      const closedJobs = JSON.parse(localStorage.getItem("closedJobs")) || [];
      const invoices = JSON.parse(localStorage.getItem("invoices")) || [];

      // Generate the next available invoice number
      const nextInvoiceNumber = getNextAvailableNumber(
        [...estimates, ...openJobs, ...closedJobs, ...invoices],
        "estimateNumber"
      );

      setEstimateNumber(nextInvoiceNumber); // Set the next available invoice number
    }
  }, [estimateNumber]);

  // Calculate total and GST/HST
  const calculateTotal = useCallback(() => {
    const roomsTotal = rooms.reduce((acc, room) => {
      if (room.roomName === "Square Footage") {
        // Use locked price per square foot if available
        const sqftCost = room.lockedSquareFootPrice || 0;
        return acc + parseFloat(room.squareFootage || 0) * sqftCost;
      }
      return acc + (room.lockedPrice ?? parseFloat(room.cost || 0)); // Use locked price or fallback to cost
    }, 0);

    const extrasTotal = extras.reduce(
      (acc, extra) => acc + (extra.lockedCost || parseFloat(extra.cost || 0)),
      0
    );

    const subtotal = roomsTotal + extrasTotal;
    setTotal(subtotal);
    setGstHst(subtotal * 0.13); // 13% GST/HST
  }, [rooms, extras]);

  useEffect(() => {
    calculateTotal();
  }, [rooms, extras, calculateTotal]);

  // Save invoice to localStorage
  const saveInvoice = () => {
    const newInvoice = {
      customerName,
      estimateNumber,
      date,
      address,
      phoneNumber,
      rooms,
      extras,
      subtotal: total,
      gstHst,
      total: total + gstHst,
      description,
      customDescription,
    };

    const invoices = JSON.parse(localStorage.getItem("invoices")) || [];
    const existingInvoiceIndex = invoices.findIndex(
      (invoice) => invoice.estimateNumber === newInvoice.estimateNumber
    );

    if (existingInvoiceIndex > -1) {
      invoices[existingInvoiceIndex] = newInvoice; // Update existing invoice
    } else {
      invoices.push(newInvoice); // Add new invoice
    }

    localStorage.setItem("invoices", JSON.stringify(invoices));
    navigate("/invoices");
  };

  // Add Room
  const addRoom = () =>
    setRooms([
      ...rooms,
      {
        roomName: "",
        cost: 0,
        lockedPrice: null, // Initialize locked price for regular rooms
        lockedSquareFootPrice: null, // Initialize locked price for square footage rooms
        squareFootage: 0,
      },
    ]);

  // Add Extra
  const addExtra = () =>
    setExtras([...extras, { type: "", cost: 0, lockedCost: null }]);

  // Update Room
  const updateRoom = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;

    // Lock the price for square footage rooms when the roomName is "Square Footage"
    if (field === "roomName" && value === "Square Footage") {
      const sqftPrice =
        costOptions.find((opt) => opt.label === "Square Footage")?.value || 0;
      updatedRooms[index].lockedSquareFootPrice = sqftPrice; // Lock the price per sqft
    }

    // Lock the price when the cost is selected for regular rooms
    if (field === "cost") {
      const selectedCost = costOptions.find(
        (option) => option.value === parseFloat(value)
      );
      if (selectedCost) {
        updatedRooms[index].lockedPrice = selectedCost.value; // Lock the price
      }
    }

    setRooms(updatedRooms);
  };

  // Update Extra
  const updateExtra = (index, field, value) => {
    const updatedExtras = [...extras];
    updatedExtras[index][field] = value;

    // Lock the cost if selected
    if (field === "cost") {
      updatedExtras[index].lockedCost = parseFloat(value); // Lock the cost
    }

    setExtras(updatedExtras);
  };

  // Remove Room/Extra
  const removeRoom = (index) => setRooms(rooms.filter((_, i) => i !== index));
  const removeExtra = (index) =>
    setExtras(extras.filter((_, i) => i !== index));

  // Toggle Edit Prices
  const toggleEditPrices = () => setEditPrices(!editPrices);

  // Save Prices
  const savePrices = () => {
    localStorage.setItem("invoiceCostOptions", JSON.stringify(costOptions)); // Save prices under 'invoiceCostOptions'
    setEditPrices(false);
    calculateTotal(); // Recalculate totals with updated prices
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Invoice</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-green text-white p-2 rounded hover:bg-green-600"
        >
          Home
        </button>
      </header>

      <main className="card-container">
        <div className="card p-4 bg-gray-100 rounded-lg">
          <section className="date flex space-x-4 mb-4">
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-bold">
                Date:
              </label>
              <input
                type="date"
                id="date"
                className="border rounded w-full p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <div>
                <label
                  htmlFor="estimateNumber"
                  className="block text-sm font-bold"
                >
                  Invoice Number:
                </label>
                <input
                  type="text"
                  id="estimateNumber"
                  className="border rounded p-2 w-20"
                  value={estimateNumber}
                  onChange={(e) => setEstimateNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          <div className="section-bordered p-4 bg-white rounded-lg shadow-sm mb-4">
            <h2 className="text-lg font-bold mb-4">Customer Information</h2>
            <section className="CustomerInfo space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-bold"
                >
                  Customer Name:
                </label>
                <input
                  type="text"
                  id="customerName"
                  className="border rounded w-full p-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-bold"
                >
                  Phone Number:
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  className="border rounded w-full p-2"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-bold">
                  Address:
                </label>
                <input
                  type="text"
                  id="address"
                  className="border rounded w-full p-2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </section>
          </div>

          {/* Description Section */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Description:</label>
            <select
              className="border p-2 w-full mb-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            >
              <option value="">Select Description</option>
              <option value="Thank you for your business!">
                Thank you for your business!
              </option>
              <option value="Payment due upon receipt.">
                Payment due upon receipt.
              </option>
              <option value="Other">Other</option>
            </select>
            {description === "Other" && (
              <input
                type="text"
                className="border p-2 mb-2 w-full"
                placeholder="Enter custom description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className="bg-darkBlue text-white p-2 rounded w-full sm:w-auto"
              onClick={addRoom}
            >
              Add Room
            </button>
            <button
              className="bg-tealLight text-white p-2 rounded w-full sm:w-auto"
              onClick={addExtra}
            >
              Add Extra/Paint
            </button>
            <button
              className="bg-blue text-white p-2 rounded w-full sm:w-auto"
              onClick={toggleEditPrices}
            >
              {editPrices ? "Close Edit Prices" : "Edit Prices"}
            </button>
          </div>

          {editPrices && (
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-bold mb-2">Edit Prices</h3>
              {costOptions.map((option, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-sm font-bold">
                    {option.label}:
                  </label>
                  <input
                    type="text"
                    value={option.value === 0 ? "" : option.value} // Show empty if value is 0
                    onChange={(e) => {
                      const updatedPrices = [...costOptions];
                      const newValue =
                        e.target.value === "" ? "" : parseFloat(e.target.value); // Allow empty string
                      updatedPrices[index].value = isNaN(newValue)
                        ? ""
                        : newValue;
                      setCostOptions(updatedPrices);
                    }}
                    className="border rounded w-full p-2"
                  />
                </div>
              ))}

              <button
                className="bg-pink text-white p-2 mt-4 rounded w-full"
                onClick={savePrices}
              >
                Save Prices
              </button>
            </div>
          )}

          {rooms.length > 0 && (
            <>
              <h3 className="font-bold mb-2">Rooms</h3>
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className="section-bordered p-4 bg-white rounded-lg shadow-sm mb-4"
                >
                  <select
                    className="border p-2 mb-2 w-full"
                    value={room.roomName}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateRoom(index, "roomName", value);
                      if (value === "Square Footage") {
                        updateRoom(index, "squareFootage", 0); // Reset square footage
                      } else {
                        updateRoom(index, "cost", 0); // Reset cost for non-square footage rooms
                      }
                    }}
                  >
                    <option value="">Select Room</option>
                    {roomOptions.map((roomName, i) => (
                      <option key={i} value={roomName}>
                        {roomName}
                      </option>
                    ))}
                  </select>

                  {/* Square Footage Input */}
                  {room.roomName === "Square Footage" && (
                    <div>
                      <label htmlFor="squareFootage">
                        Enter Square Footage:
                      </label>
                      <input
                        type="number"
                        className="border p-2 mb-2 w-full"
                        value={room.squareFootage}
                        onChange={(e) =>
                          updateRoom(index, "squareFootage", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Cost Input for Regular Rooms */}
                  {room.roomName !== "Square Footage" && (
                    <select
                      className="border p-2 mb-2 w-full"
                      value={room.cost}
                      onChange={(e) =>
                        updateRoom(index, "cost", parseFloat(e.target.value))
                      }
                    >
                      <option value="">Select Cost</option>
                      {costOptions.map((option, i) => (
                        <option key={i} value={option.value}>
                          {option.label} - ${option.value}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={() => removeRoom(index)}
                    className="bg-pink text-white p-2 rounded hover:bg-darkGray w-full mt-2"
                  >
                    Remove Room
                  </button>
                </div>
              ))}
            </>
          )}

          {extras.length > 0 && (
            <>
              <h3 className="font-bold mb-2">Extras</h3>
              {extras.map((extra, index) => (
                <div
                  key={index}
                  className="section-bordered p-4 bg-white rounded-lg shadow-sm mb-4"
                >
                  <select
                    className="border p-2 mb-2 w-full"
                    value={extra.type}
                    onChange={(e) => updateExtra(index, "type", e.target.value)}
                  >
                    <option value="">Select Extra</option>
                    {extraOptions.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="border p-2 mb-2 w-full"
                    placeholder="Cost"
                    value={extra.cost}
                    onChange={(e) => updateExtra(index, "cost", e.target.value)}
                  />
                  <button
                    onClick={() => removeExtra(index)}
                    className="bg-pink text-white p-2 rounded hover:bg-darkGray w-full mt-2"
                  >
                    Remove Extra
                  </button>
                </div>
              ))}
            </>
          )}

          <div className="section-bordered border-t mt-4 pt-4">
            <div className="flex justify-between">
              <p>Subtotal:</p>
              <p>${Number(total).toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p>GST/HST (13%):</p>
              <p>${Number(gstHst).toFixed(2)}</p>
            </div>
            <div className="flex justify-between font-bold">
              <p>Total:</p>
              <p>${(Number(total) + Number(gstHst)).toFixed(2)}</p>
            </div>
          </div>

          <button
            className="bg-green text-white p-2 mt-4 w-full rounded"
            onClick={saveInvoice}
          >
            Save Invoice
          </button>
        </div>
      </main>
    </div>
  );
};

export default NewInvoice;
