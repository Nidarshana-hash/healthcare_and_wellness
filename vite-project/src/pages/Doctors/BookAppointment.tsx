import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db, auth } from "@/firebase";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  location: string;
  avatar: string;
  availableSlots: string[];
}

const BookAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    patientName: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);

  // Doctor list (simulate DB or API)
  useEffect(() => {
    const doctors: Doctor[] = [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        location: "Medical Center Downtown",
        avatar:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
        availableSlots: ["9:00 AM", "2:00 PM", "4:00 PM"],
      },
      {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "Dermatology",
        location: "Skin Care Clinic",
        avatar:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300",
        availableSlots: ["10:00 AM", "1:00 PM", "3:30 PM"],
      },
      {
        id: 3,
        name: "Dr. Emily Rodriguez",
        specialty: "Pediatrics",
        location: "Children's Hospital",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        availableSlots: ["11:00 AM", "2:30 PM"],
      },
      {
        id: 4,
        name: "Dr. James Wilson",
        specialty: "Orthopedics",
        location: "Bone & Joint Center",
        avatar:
          "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300",
        availableSlots: ["9:30 AM", "1:30 PM", "4:30 PM"],
      },
    ];

    const found = doctors.find((d) => d.id === Number(doctorId));
    setDoctor(found || null);
  }, [doctorId]);

  // Input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form submission (🔥 Firebase integrated)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Please login to book appointment");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Save appointment
      await addDoc(collection(db, "appointments"), {
        userId: user.uid,
        patientName: formData.patientName,
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        location: doctor.location,
        date: formData.date,
        time: formData.time,
        status: "confirmed",
        createdAt: Timestamp.now(),
      });

      // 2️⃣ Create notification
      await addDoc(collection(db, "notifications"), {
        userId: user.uid,
        type: "appointment",
        title: "Appointment Confirmed",
        message: `Your appointment with ${doctor.name} on ${formData.date} at ${formData.time} has been confirmed.`,
        priority: "medium",
        isRead: false,
        createdAt: Timestamp.now(),
      });

      // 3️⃣ Navigate to success page
      navigate("/booking-success", {
        state: {
          doctor,
          appointment: formData,
        },
      });
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  // Show loader if doctor not found
  if (!doctor)
    return (
      <p className="text-center mt-10 text-gray-600">
        ⚠️ Doctor not found or loading details...
      </p>
    );

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-xl shadow-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-2">
            Book Appointment
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center mb-4">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">
              {doctor.specialty}
            </p>
            <p className="text-xs text-muted-foreground">
              {doctor.location}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="patientName"
              placeholder="Your Full Name"
              value={formData.patientName}
              onChange={handleChange}
              required
            />

            <div>
              <label className="text-sm font-medium">Select Date</label>
              <div className="flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Select Time</label>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <select
                  className="border p-2 rounded w-full"
                  name="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  required
                >
                  <option value="">-- Choose Time Slot --</option>
                  {doctor.availableSlots.map((slot, i) => (
                    <option key={i} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookAppointment;
