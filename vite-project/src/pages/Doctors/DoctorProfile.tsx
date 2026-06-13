import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star, 
  MapPin, 
  Clock, 
  ChevronLeft, 
  Award, 
  BookOpen, 
  Stethoscope,
  CalendarCheck
} from "lucide-react";

// Mock data (Keep your existing data structure)
const DOCTORS_DATA = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    rating: 4.9,
    reviews: 156,
    experience: "15+ years",
    location: "Medical Center Downtown",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
    fee: "₹1,660",
    bio: "Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating complex heart conditions. She specializes in preventive cardiology and non-invasive diagnostic procedures.",
    education: ["M.D. Cardiology - Harvard Medical School", "Residency - Mayo Clinic"],
    languages: ["English", "Spanish"]
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
    fee: "₹996",
    bio: "Dr. Chen is a leading expert in dermatological surgery and medical aesthetics. He has published numerous papers on advanced skin cancer treatments.",
    education: ["M.D. Dermatology - Stanford University", "Fellowship in Dermatologic Surgery"],
    languages: ["English", "Mandarin"]
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
    fee: "₹1,245",
    bio: "Dedicated to providing compassionate care for children from infancy through adolescence. Dr. Rodriguez believes in a holistic approach to pediatric health.",
    education: ["M.D. Pediatrics - Johns Hopkins University", "Board Certified Pediatrician"],
    languages: ["English", "Spanish", "Portuguese"]
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
    fee: "₹2,075",
    bio: "Specializing in sports medicine and joint replacement surgery. Dr. Wilson has worked with professional athletes and focuses on rapid recovery techniques.",
    education: ["M.D. Orthopedic Surgery - Yale University", "Sports Medicine Fellowship"],
    languages: ["English"]
  }
];

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctor = DOCTORS_DATA.find(d => d.id === Number(id));

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold">Doctor not found</h2>
        <Button onClick={() => navigate("/doctors")} className="mt-4">Return to List</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-12">
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

      <div className="relative z-10">
        {/* Top Navigation */}
        <div className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/doctors")} className="gap-2 hover:bg-slate-100">
              <ChevronLeft className="w-4 h-4" />
              Back to Search
            </Button>
            <div className="flex gap-3">
               <Button variant="outline" size="sm" className="bg-white/50">Share</Button>
               <Button size="sm" onClick={() => navigate(`/book/${doctor.id}`)}>Book Now</Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                  <img 
                    src={doctor.avatar} 
                    alt={doctor.name} 
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                      <Badge className="bg-primary/90 text-white border-none">{doctor.specialty}</Badge>
                      <Badge variant="outline" className="bg-white/80">{doctor.experience} Exp</Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{doctor.name}</h1>
                    <div className="flex items-center justify-center md:justify-start mt-2 text-slate-700 gap-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                        <span className="font-bold">{doctor.rating}</span>
                        <span className="ml-1 text-sm">({doctor.reviews} Reviews)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1 text-primary" />
                        {doctor.location}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <section className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border-none shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                <Stethoscope className="w-5 h-5 text-primary" />
                About Doctor
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                {doctor.bio}
              </p>
            </section>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border-none shadow-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Education
                </h2>
                <ul className="space-y-3">
                  {doctor.education.map((edu, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      {edu}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white/95 backdrop-blur-sm p-6 rounded-xl border-none shadow-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <Award className="w-5 h-5 text-primary" />
                  Specializations
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{doctor.specialty}</Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Consultation</Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Diagnosis</Badge>
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Booking Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-none shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">Consultation Fee</span>
                  <span className="text-2xl font-black text-primary">{doctor.fee}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black">Next Available</p>
                      <p className="text-sm font-bold text-slate-700">Today, 02:00 PM</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg font-bold shadow-lg bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                    onClick={() => navigate(`/book/${doctor.id}`)}
                  >
                    <CalendarCheck className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Button>
                  
                  <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                    Secure Booking • Instant Confirmation
                  </p>
                </div>

                <hr className="my-6 border-slate-100" />

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-800">Supported Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map(lang => (
                      <Badge key={lang} variant="outline" className="text-xs font-semibold border-slate-200">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;