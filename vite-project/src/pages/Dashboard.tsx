import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Heart, 
  Pill, 
  TrendingUp, 
  Clock, 
  Plus,
  Activity
} from "lucide-react";
import heroImage from "@/assets/healthcare-hero.jpg";

const Dashboard = () => {
  const quickActions = [
    {
      title: "Book Appointment",
      description: "Find and book with healthcare professionals",
      icon: Calendar,
      href: "/doctors",
      variant: "medical" as const,
    },
    {
      title: "Start Consultation",
      description: "Connect with doctors online",
      icon: MessageSquare,
      href: "/consultation",
      variant: "default" as const,
    },
    {
      title: "View EHR",
      description: "Access your health records",
      icon: FileText,
      href: "/ehr",
      variant: "outline" as const,
    },
    {
      title: "Wellness Hub",
      description: "Explore health and wellness content",
      icon: Heart,
      href: "/wellness",
      variant: "wellness" as const,
    },
    {
      title: "Student Performance",
      description: "Predict and analyze student academic performance",
      icon: TrendingUp,
      href: "/student-performance.html",
      variant: "secondary" as const,
      external: true,
    },
  ];

  const recentActivity = [
    { type: "Appointment", description: "Dr. Smith - Cardiology", time: "Today, 2:00 PM" },
    { type: "Prescription", description: "Refill request approved", time: "Yesterday" },
    { type: "Lab Results", description: "Blood work results available", time: "2 days ago" },
  ];

  const stats = [
    { label: "Upcoming Appointments", value: "3", icon: Calendar },
    { label: "Active Prescriptions", value: "2", icon: Pill },
    { label: "Health Score", value: "85%", icon: Activity },
    { label: "Wellness Streak", value: "7 days", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Healthcare professionals in modern medical facility" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient opacity-90" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Health, <span className="text-accent">Our Priority</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Complete healthcare and wellness platform connecting you with trusted doctors, 
              managing your health records, and supporting your wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/doctors">
                <Button size="lg" variant="medical" className="w-full sm:w-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
              </Link>
              <Link to="/consultation">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white hover:text-primary">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center medical-shadow hover:hover-shadow medical-transition">
                  <CardContent className="pt-6">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Quick Actions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access the most important healthcare services with just a few clicks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isExternal = action.external;
              return (
                <Card key={index} className="card-shadow hover:hover-shadow medical-transition group cursor-pointer">
                  {isExternal ? (
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      <CardHeader className="text-center pb-2">
                        <div className="w-12 h-12 medical-gradient rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 medical-transition">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant={action.variant} className="w-full">
                          Get Started
                          <Plus className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </a>
                  ) : (
                    <Link to={action.href}>
                      <CardHeader className="text-center pb-2">
                        <div className="w-12 h-12 medical-gradient rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 medical-transition">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant={action.variant} className="w-full">
                          Get Started
                          <Plus className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <Card key={index} className="card-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div>
                        <div className="font-medium text-foreground">{activity.type}</div>
                        <div className="text-sm text-muted-foreground">{activity.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{activity.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Link to="/notifications">
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;