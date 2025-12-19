// Admin pages
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeProvider";
import Welcome from "../pages/public/WelcomePage";
import Dashboard from "../pages/admin/AdminDashboardPage";
import Vehicles from "../pages/admin/VehiclesPage";
import Bookings from "../pages/admin/BookingsPage";
import Customers from "../pages/admin/CustomersPage";
import Staff from "../pages/admin/StaffPage";
import RoleSelection from "../pages/admin/RolesPage";
import SignupScreen from "../pages/public/SignUpPage";
import SignInScreen from "../pages/public/SignInPage";

//Custormer pages 
import Dashboardy from "../pages/customer/CustomerDashboardPage";
import Vihicles from "../pages/customer/Vihicle";
import Reservation from "../pages/customer/CustomerReservationsPage";
import Service from "../pages/customer/CustomerServicePage";
import Profile from "../pages/customer/CustomerProfilePage";
import Drivers from "../pages/customer/CustomerDriversPage";
import BookingPage from "../pages/customer/Bookingpage";
import ChatScreen from "../pages/customer/Chat";
import NotificationScreen from "../pages/customer/notification";



//Agent Pages
import AgentDashboard from "../pages/agent/agentdashboard";
import AgentbookingPage from "../pages/agent/agentbooking";
import UsersListScreen from "../pages/agent/users";
import AgentVehicles from "../pages/agent/agentvihicles";
import Agentdrivers from "../pages/agent/agentdriver";
import AgentReservation from "../pages/agent/agentreservation";
import AgentChatScreen from "../pages/agent/agentchart";
import AgentProfile from "../pages/agent/agentprofile";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>

        //Admin routes
          <Route path="/" element={<Welcome />} />
          <Route path="/roles" element={<RoleSelection/>} />
          <Route path="/signup" element={<SignupScreen/>} />
          <Route path="/login" element={<SignInScreen/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicless" element={<Vehicles />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/staff" element={<Staff />} />

          // customer Routes
          <Route path="/dashboardy" element={<Dashboardy/>} />
          <Route path="/vehicle" element={<Vihicles/>} />
          <Route path="/reservations" element={<Reservation/>} />
          <Route path="/orders" element={<Service/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/driver" element={<Drivers/>} />
          <Route path="/book/:id" element={<BookingPage/>} />
           <Route path="/chart" element={<ChatScreen/>} />
           <Route path="/notification" element={<NotificationScreen/>} />


           //Agent Routes
            <Route path="/agentdashboard" element={<AgentDashboard/>} />
            <Route path="/agentbook/:id" element={<AgentbookingPage/>} />
            <Route path="/user" element={<UsersListScreen/>} />
            <Route path="/agent" element={<AgentVehicles/>} />
            <Route path="/agentdriver" element={<Agentdrivers/>} />
            <Route path="/agentreservations" element={<AgentReservation/>} />
            <Route path="/agentchart" element={<AgentChatScreen/>} />
             <Route path="/agentprofile" element={<AgentProfile/>} />



       </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
