import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getNextAvailableNumber } from "../utils";

const EstimateCalculator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialData = location.state?.job || location.state?.estimate || {};

  const [customerName, setCustomerName] = useState(
    initialData.customerName || ""
  );
  const [estimateNumber, setEstimateNumber] = useState(
    initialData.estimateNumber || ""
  );
  const [date, setDate] = useState(initialData.date || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || "");
  const [rooms, setRooms] = useState(initialData.rooms || []);
  const [extras, setExtras] = useState(initialData.extras || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [gstHst, setGstHst] = useState(initialData.gstHst || 0);
  const [editPrices, setEditPrices] = useState(false);
  const [description, setDescription] = useState(initialData.description || "");
  const [customDescription, setCustomDescription] = useState(
    initialData.customDescription || ""
  );

  const defaultCostOptions = [
    { label: "Square Footage", value: 3.0 },
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
    { label: "Just trim and doors", value: 150 },
    { label: "Painting Stairs", value: 125 },
    { label: "Staining Stairs", value: 500 },
    { label: "Matching Stain to floor", value: 600 },
    { label: "Staining Beam", value: 250 },
    { label: "Painting Railing", value: 450 },
    { label: "Staining Railing", value: 550 },
    { label: "Other", value: 50 },
  ];

  const [costOptions, setCostOptions] = useState(() => {
    const savedCostOptions =
      JSON.parse(localStorage.getItem("estimateCostOptions")) || [];
    const mergedOptions = [...defaultCostOptions];

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

  const extraOptions = ["Paint", "Stain", "Primer", "Travel", "Other"];
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

  useEffect(() => {
    if (!estimateNumber) {
      const estimates = JSON.parse(localStorage.getItem("estimates")) || [];
      const openJobs = JSON.parse(localStorage.getItem("openJobs")) || [];
      const closedJobs = JSON.parse(localStorage.getItem("closedJobs")) || [];
      const invoices = JSON.parse(localStorage.getItem("invoices")) || [];

      const nextEstimateNumber = getNextAvailableNumber(
        [...estimates, ...openJobs, ...closedJobs, ...invoices],
        "estimateNumber"
      );

      setEstimateNumber(nextEstimateNumber);
    }
  }, [estimateNumber]);

  const calculateTotal = useCallback(() => {
    const roomsTotal = rooms.reduce((acc, room) => {
      if (room.roomName === "Square Footage") {
        const squareFootagePrice =
          room.lockedSquareFootPrice ||
          costOptions.find((option) => option.label === "Square Footage")
            ?.value ||
          0;
        return acc + (room.squareFootage * squareFootagePrice || 0);
      } else {
        return acc + (room.lockedPrice || parseFloat(room.cost || 0));
      }
    }, 0);

    const extrasTotal = extras.reduce(
      (acc, extra) => acc + parseFloat(extra.lockedCost || extra.cost || 0),
      0
    );

    const subtotal = roomsTotal + extrasTotal;
    setTotal(subtotal);
    setGstHst(subtotal * 0.13);
  }, [rooms, extras, costOptions]);

  useEffect(() => {
    calculateTotal();
  }, [rooms, extras, calculateTotal]);

  const addRoom = () =>
    setRooms([
      ...rooms,
      {
        roomName: "",
        customRoomName: "",
        cost: 0,
        lockedPrice: 0,
        squareFootage: 0,
      },
    ]);

  const addExtra = () =>
    setExtras([
      ...extras,
      { type: "", customType: "", cost: 0, lockedCost: 0 },
    ]);

  const updateRoom = (index, field, value) => {
    const updatedRooms = [...rooms];

    if (field === "cost") {
      const selectedCost = costOptions.find(
        (opt) => opt.value === parseFloat(value)
      );
      if (selectedCost) {
        updatedRooms[index].lockedPrice = selectedCost.value;
      }
    }

    if (field === "roomName" && value === "Square Footage") {
      const sqftPrice =
        costOptions.find((opt) => opt.label === "Square Footage")?.value || 0;
      updatedRooms[index].lockedSquareFootPrice = sqftPrice;
    }

    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
    calculateTotal();
  };

  const updateExtra = (index, field, value) => {
    const updatedExtras = [...extras];

    if (field === "cost") {
      updatedExtras[index].lockedCost = value;
    }

    updatedExtras[index][field] = value;
    setExtras(updatedExtras);
    calculateTotal();
  };

  const toggleEditPrices = () => setEditPrices(!editPrices);

  const removeRoom = (index) => setRooms(rooms.filter((_, i) => i !== index));
  const removeExtra = (index) =>
    setExtras(extras.filter((_, i) => i !== index));

  const savePrices = () => {
    localStorage.setItem("estimateCostOptions", JSON.stringify(costOptions));
    setEditPrices(false);
    calculateTotal();
  };

  const saveEstimate = () => {
    const gstHst = total * 0.13;

    const updatedEstimate = {
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

    const estimates = JSON.parse(localStorage.getItem("estimates")) || [];
    const estimateIndex = estimates.findIndex(
      (estimate) => estimate.estimateNumber === estimateNumber
    );

    if (estimateIndex !== -1) {
      estimates[estimateIndex] = updatedEstimate;
    } else {
      estimates.push(updatedEstimate);
    }

    localStorage.setItem("estimates", JSON.stringify(estimates));
    navigate("/estimates");
  };

  const descriptionOptions = [
    "This estimate is valid for 10 days and includes both labor and materials. Any additional work or materials not covered will incur extra charges. Feel free to contact me for any questions.",
    "This estimate is valid for 10 days and includes labor for the agreed-upon scope of work. Any additional tasks or materials not mentioned will result in extra costs. Feel free to contact me with questions.",
    "Includes all the labor, paint is extra.",
    "Includes both labor and paint.",
    "Other",
  ];

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Paint Job Estimator
        </h1>
        <button
          onClick={() => navigate("/")}
          className="bg-green text-white p-2 rounded hover:bg-gray-600"
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
                name="date"
                className="border rounded w-full p-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                autoComplete="date"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div>
                <label
                  htmlFor="estimateNumber"
                  className="block text-sm font-bold"
                >
                  Estimate Number:
                </label>
                <input
                  type="text"
                  id="estimateNumber"
                  name="estimateNumber"
                  className="border rounded p-2 w-20"
                  value={estimateNumber}
                  onChange={(e) => setEstimateNumber(e.target.value)}
                  required
                  autoComplete="estimate-number"
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
                  name="customerName"
                  className="border rounded w-full p-2"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  autoComplete="name"
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
                  name="phoneNumber"
                  className="border rounded w-full p-2"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-bold">
                  Address:
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="border rounded w-full p-2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  autoComplete="address-line1"
                />
              </div>
            </section>
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
              <h3 className="text-lg font-bold mb-2">Edit Room Prices</h3>
              {costOptions.map((option, index) => (
                <div key={index} className="mb-2">
                  <label
                    htmlFor={`costOption-${index}`}
                    className="block text-sm font-bold"
                  >
                    {option.label}:
                  </label>
                  <input
                    type="text"
                    id={`costOption-${index}`}
                    name={`costOption-${index}`}
                    value={option.value === 0 ? "" : option.value}
                    onChange={(e) => {
                      const newValue =
                        e.target.value === "" ? "" : parseFloat(e.target.value);
                      const updatedOptions = costOptions.map((item, i) =>
                        i === index
                          ? { ...item, value: isNaN(newValue) ? "" : newValue }
                          : item
                      );
                      setCostOptions(updatedOptions);
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

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-bold mb-2"
            >
              Description:
            </label>
            <select
              id="description"
              name="description"
              className="border p-2 w-full mb-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            >
              <option value="">Select Description</option>
              {descriptionOptions.map((option, index) => (
                <option key={index} value={option}>
                  {truncateText(option, 70)}
                </option>
              ))}
            </select>

            {description && description !== "Other" && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <p style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                  {description}
                </p>
              </div>
            )}

            {description === "Other" && (
              <input
                type="text"
                id="customDescription"
                name="customDescription"
                className="border p-2 mb-2 w-full"
                placeholder="Enter custom description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                autoComplete="off"
              />
            )}
          </div>

          {rooms.length > 0 && (
            <>
              <h3 className="font-bold mb-2">Rooms</h3>
              {rooms.map((room, index) => (
                <div
                  key={index}
                  className="section-bordered p-4 bg-white rounded-lg shadow-sm mb-4"
                >
                  <label
                    htmlFor={`roomName-${index}`}
                    className="block text-sm font-bold"
                  >
                    Room Name:
                  </label>
                  <select
                    id={`roomName-${index}`}
                    name={`roomName-${index}`}
                    className="border p-2 mb-2 w-full"
                    value={room.roomName}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateRoom(index, "roomName", value);
                      if (value === "Square Footage") {
                        updateRoom(index, "squareFootage", 0);
                        updateRoom(index, "cost", 3);
                      } else {
                        updateRoom(index, "cost", 0);
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

                  {room.roomName === "Square Footage" && (
                    <>
                      <div>
                        <label
                          htmlFor={`squareFootage-${index}`}
                          className="block text-sm font-bold"
                        >
                          Enter Square Footage:
                        </label>
                        <input
                          type="number"
                          id={`squareFootage-${index}`}
                          name={`squareFootage-${index}`}
                          className="border p-2 mb-2 w-full"
                          value={room.squareFootage}
                          onChange={(e) =>
                            updateRoom(index, "squareFootage", e.target.value)
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`cost-${index}`}
                          className="block text-sm font-bold"
                        >
                          Select Cost per Square Foot:
                        </label>
                        <select
                          id={`cost-${index}`}
                          name={`cost-${index}`}
                          className="border p-2 mb-2 w-full"
                          value={room.lockedSquareFootPrice || room.cost}
                          onChange={(e) => {
                            const selectedCost = parseFloat(e.target.value);
                            updateRoom(index, "cost", selectedCost);
                            updateRoom(
                              index,
                              "lockedSquareFootPrice",
                              selectedCost
                            );
                            calculateTotal();
                          }}
                        >
                          <option value="">Select Cost</option>
                          {costOptions.map((option, i) => (
                            <option key={i} value={option.value}>
                              {option.label} - ${option.value} per sq. ft.
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {room.roomName !== "Square Footage" && (
                    <>
                      <label
                        htmlFor={`cost-${index}`}
                        className="block text-sm font-bold"
                      >
                        Select Cost:
                      </label>
                      <select
                        id={`cost-${index}`}
                        name={`cost-${index}`}
                        className="border p-2 mb-2 w-full"
                        value={room.lockedPrice || room.cost}
                        onChange={(e) => {
                          const selectedCost = parseFloat(e.target.value);
                          updateRoom(index, "cost", selectedCost);
                          updateRoom(index, "lockedPrice", selectedCost);
                          calculateTotal();
                        }}
                      >
                        <option value="">Select Cost</option>
                        {costOptions.map((option, i) => (
                          <option key={i} value={option.value}>
                            {option.label} - ${option.value}
                          </option>
                        ))}
                      </select>
                    </>
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
                  <label
                    htmlFor={`extraType-${index}`}
                    className="block text-sm font-bold"
                  >
                    Extra Type:
                  </label>
                  <select
                    id={`extraType-${index}`}
                    name={`extraType-${index}`}
                    className="border p-2 mb-2 w-full"
                    value={extra.type}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateExtra(index, "type", value);
                      if (value === "Other") {
                        updateExtra(index, "customType", "");
                      }
                    }}
                  >
                    <option value="">Select Extra</option>
                    {extraOptions.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {extra.type === "Other" && (
                    <>
                      <label
                        htmlFor={`customType-${index}`}
                        className="block text-sm font-bold"
                      >
                        Custom Extra:
                      </label>
                      <input
                        type="text"
                        id={`customType-${index}`}
                        name={`customType-${index}`}
                        className="border p-2 mb-2 w-full"
                        placeholder="Enter custom extra"
                        value={extra.customType}
                        onChange={(e) =>
                          updateExtra(index, "customType", e.target.value)
                        }
                      />
                    </>
                  )}

                  <label
                    htmlFor={`extraCost-${index}`}
                    className="block text-sm font-bold"
                  >
                    Cost:
                  </label>
                  <input
                    type="number"
                    id={`extraCost-${index}`}
                    name={`extraCost-${index}`}
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
              <p>${total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p>GST/HST (13%):</p>
              <p>${gstHst.toFixed(2)}</p>
            </div>
            <div className="flex justify-between font-bold">
              <p>Total:</p>
              <p>${(total + gstHst).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <button
              className="bg-green text-white p-2 w-full sm:w-auto rounded"
              onClick={saveEstimate}
            >
              Save Estimate
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EstimateCalculator;
