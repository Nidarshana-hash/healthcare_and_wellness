import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ useNavigate for routing
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Calendar, Clock, Filter } from "lucide-react";

const USD_TO_INR = 83; // 1 USD = 83 INR

const DoctorsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("");
  const navigate = useNavigate(); // ✅ navigation hook

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      rating: 4.9,
      reviews: 156,
      experience: "15+ years",
      location: "Medical Center Downtown",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
      availableSlots: ["9:00 AM", "2:00 PM", "4:00 PM"],
      consultationFee: "20",
      isOnline: true,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Dermatology",
      rating: 4.8,
      reviews: 243,
      experience: "12+ years",
      location: "Skin Care Clinic",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300",
      availableSlots: ["10:00 AM", "1:00 PM", "3:30 PM"],
      consultationFee: "12",
      isOnline: true,
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      rating: 4.9,
      reviews: 189,
      experience: "10+ years",
      location: "Children's Hospital",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      availableSlots: ["11:00 AM", "2:30 PM"],
      consultationFee: "15",
      isOnline: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialty: "Orthopedics",
      rating: 4.7,
      reviews: 178,
      experience: "18+ years",
      location: "Bone & Joint Center",
      avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300",
      availableSlots: ["9:30 AM", "1:30 PM", "4:30 PM"],
      consultationFee: "25",
      isOnline: true,
    },
  ];

  const specialties = ["All Specialties", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology", "Psychiatry"];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      !specialty || specialty === "All Specialties" || doctor.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen relative">
      {/* PROFESSIONAL BACKGROUND IMAGE LAYER */}
<div 
  className="fixed inset-0 z-0"
  style={{
    // New high-quality healthcare interior image
    backgroundImage: `url(https://th.bing.com/th/id/OIP.jEIorB3Kbxka1-dkG2oLTwHaDF?w=306&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Dark overlay to make text readable */}
  <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]" />
</div>

      {/* CONTENT LAYER */}
      <div className="relative z-10">
        {/* Header */}
        <section className="bg-white/40 backdrop-blur-md border-b py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Find Your Doctor</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Book appointments with trusted healthcare professionals
            </p>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 border-slate-200"
                />
              </div>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-full md:w-48 bg-white/80 border-slate-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Doctors Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-foreground">
                Available Doctors ({filteredDoctors.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="card-shadow hover:hover-shadow medical-transition group bg-white/90 backdrop-blur-sm border-none"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img
                          src={doctor.avatar}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        {doctor.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <CardDescription className="text-primary font-medium">
                          {doctor.specialty}
                        </CardDescription>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{doctor.rating}</span>
                            <span className="ml-1">({doctor.reviews})</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {doctor.experience}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{doctor.location}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Consultation Fee:</span>
                        <span className="text-lg font-bold text-primary">
                          ₹
                          {(
                            parseInt(doctor.consultationFee.replace("$", "")) * USD_TO_INR
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Available Today:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {doctor.availableSlots.map((slot, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-white/50">
                              {slot}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-white/50"
                          onClick={() => navigate(`/doctors/${doctor.id}`)}
                        >
                          View Profile
                        </Button>

                        <Button
                          variant="medical"
                          className="flex-1"
                          onClick={() => navigate(`/book/${doctor.id}`)}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-24 bg-white/40 backdrop-blur-md rounded-xl border-2 border-dashed border-slate-200">
                <div className="text-muted-foreground mb-4">
                  No doctors found matching your criteria
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSpecialty("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DoctorsList;