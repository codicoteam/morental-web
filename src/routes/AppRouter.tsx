// import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "../components/themecontext";
import Welcome from "../pages/Welcome";
import Dashboard from "../pages/Dashboard";
import Vehicles from "../pages/Vehicles";
import Bookings from "../pages/Bookings";
import Customers from "../pages/Customers";
import Staff from "../pages/Staff";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/staff" element={<Staff />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
