import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface BookingState {
  doctor: {
    name: string;
    specialty: string;
    location: string;
  };
  appointment: {
    patientName: string;
    date: string;
    time: string;
  };
}

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BookingState | null;

  // If page refreshed or opened directly
  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">
          ⚠️ No booking details found.
        </p>
        <Button onClick={() => navigate("/doctors")}>
          Book Appointment
        </Button>
      </div>
    );
  }

  const { doctor, appointment } = state;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4">
      <CheckCircle className="w-16 h-16 text-green-600 mb-4" />

      <h1 className="text-3xl font-bold text-green-700 mb-2">
        Appointment Confirmed!
      </h1>

      <p className="text-gray-600 mb-6 text-center max-w-md">
        Your appointment has been successfully booked. Please find the details
        below.
      </p>

      {/* Appointment Details */}
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md mb-6">
        <p className="text-sm text-gray-500 mb-2">
          <strong>Patient:</strong> {appointment.patientName}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>Doctor:</strong> {doctor.name}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>Specialty:</strong> {doctor.specialty}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>Location:</strong> {doctor.location}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          <strong>Date:</strong> {appointment.date}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Time:</strong> {appointment.time}
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate("/doctors")}
        >
          Book Another Doctor
        </Button>
      </div>
    </div>
  );
};

export default BookingSuccess;
