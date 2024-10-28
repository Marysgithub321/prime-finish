// Helper function to get the next available unique number
export const getNextAvailableNumber = () => {
    // Get all existing numbers from localStorage
    const estimates = JSON.parse(localStorage.getItem("estimates")) || [];
    const openJobs = JSON.parse(localStorage.getItem("openJobs")) || [];
    const closedJobs = JSON.parse(localStorage.getItem("closedJobs")) || [];
    const invoices = JSON.parse(localStorage.getItem("invoices")) || [];
  
    // Combine all numbers into a single array
    const allNumbers = [
      ...estimates.map(e => parseInt(e.estimateNumber, 10)),
      ...openJobs.map(e => parseInt(e.estimateNumber, 10)),
      ...closedJobs.map(e => parseInt(e.estimateNumber, 10)),
      ...invoices.map(i => parseInt(i.estimateNumber, 10))
    ].filter(Boolean); // Remove any invalid or undefined numbers
  
    // Find the highest number and generate the next available number
    const maxNumber = allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
    const nextNumber = (maxNumber + 1).toString().padStart(2, "0");
  
    return nextNumber;
  };
  