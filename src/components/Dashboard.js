import React, { useEffect } from "react";
import "aos/dist/aos.css";
import AOS from "aos";
import { Link } from "react-router-dom"; // Import Link for navigation

const Dashboard = () => {
  // Initialize AOS for animation on scroll
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  // Card data with icons located in the public folder
  const cards = [
    { name: "Estimates", icon: "/icons/estimate.png", link: "/estimates" },
    { name: "Invoices", icon: "/icons/invoice.png", link: "/invoices" },
    {
      name: "New Estimate",
      icon: "/icons/calculator.png",
      link: "/estimate-calculator",
    },
    { name: "New Invoice", icon: "/icons/addjob.png", link: "/new-invoice" },
    {
      name: "Receipts/Expenses",
      icon: "/icons/expenses.png",
      link: "/expenses",
    },
    { name: "Open Jobs", icon: "/icons/openjob.png", link: "/open-jobs" },
    { name: "Closed Jobs", icon: "/icons/pastjobs.png", link: "/past-jobs" },
    {
      name: "Contractor Payouts",
      icon: "/icons/payday.png",
      link: "/contractor-payouts",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-lightGray">
      {/* Flex container for the logo */}
      <div className="w-full flex items-center justify-center bg-lightGray">
        {/* Logo centered at the top */}
        <img
          src="/icons/PrimeFinishLogo.png"
          alt="Prime Finish Logo"
          style={{
            marginTop: "20px", // Custom margin-top
            marginLeft: "0px", // Custom margin-left if needed
          }}
        />
      </div>

      {/* Cards Section */}
      <div
        className="w-full px-5 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-5"
        style={{
          paddingLeft: "20px",
          paddingRight: "20px",
          marginTop: "20px", // Space between the logo and cards
          marginBottom: "20px", // Space between cards and the footer
        }}
      >
        {cards.map((card, index) => (
          <Link
            to={card.link} // Link to the corresponding route
            key={index}
            className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center"
            style={{ minWidth: "150px", height: "150px", flexGrow: 1 }}
            data-aos="zoom-in"
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={card.icon}
              alt={card.name}
              className="w-12 h-12 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-12 lg:h-12 mb-2" // Responsive size
            />
            {/* Make sure text stays on one line */}
            <button className="text-black text-sm text-center whitespace-nowrap">
              {card.name}
            </button>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center p-4 w-full bg-darkGray text-lightGray">
        <p>© {new Date().getFullYear()} All rights reserved Prime Finish Painting.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
