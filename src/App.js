import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import EstimateCalculator from "./components/estimatecalculator";
import Estimates from "./components/estimates";
import Invoices from "./components/Invoices";
import Expenses from "./components/expenses";
import NewInvoice from "./components/NewInvoice"; // Updated the file name to NewInvoice.js
import OpenJobs from "./components/openJobs";
import PastJobs from "./components/pastJobs";
import ContractorPayouts from "./components/staffPayouts"; // Assuming this is the same as "ContractorPayouts"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Route for the Dashboard (home) */}
          <Route path="/" element={<Dashboard />} />
          {/* Route for each card component */}
          <Route path="/estimate-calculator" element={<EstimateCalculator />} />
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/new-invoice" element={<NewInvoice />} />{" "}
          <Route path="/open-jobs" element={<OpenJobs />} />
          <Route path="/past-jobs" element={<PastJobs />} />
          <Route path="/contractor-payouts" element={<ContractorPayouts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
