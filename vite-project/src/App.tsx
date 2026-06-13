import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import DoctorsList from "./pages/Doctors/DoctorsList";
import BookAppointment from "./pages/Doctors/BookAppointment";
import Consultation from "./pages/Consultation";
import EHRDashboard from "./pages/EHR/EHRDashboard";
import WellnessHub from "./pages/Wellness/WellnessHub";
import PharmacyStore from "./pages/Pharmacy/PharmacyStore";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import BookingSuccess from "./pages/Doctors/BookingSuccess";
// Import the profile component (ensure this file exists in your directory)
import DoctorProfile from "./pages/Doctors/DoctorProfile"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          
          {/* Main App Routes with Navbar */}
          <Route path="/*" element={
            <div className="min-h-screen">
              <Navbar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/doctors" element={<DoctorsList />} />
                
                {/* Fixed: Added route for individual doctor profiles */}
                <Route path="/doctors/:id" element={<DoctorProfile />} /> 
                
                <Route path="/book/:doctorId" element={<BookAppointment />} />
                <Route path="/booking-success" element={<BookingSuccess />} />
                
                <Route path="/consultation" element={<Consultation />} />
                <Route path="/ehr" element={<EHRDashboard />} />
                <Route path="/wellness" element={<WellnessHub />} />
                <Route path="/pharmacy" element={<PharmacyStore />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Wildcard route should always be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;