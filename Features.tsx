import { Calendar, Clock, BookOpen, Users, Bell, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "AI-powered timetable generation that optimizes classroom allocation and prevents conflicts automatically",
  },
  {
    icon: Clock,
    title: "Real-Time Reservations",
    description: "Book classrooms and resources instantly with live availability updates and confirmation notifications",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Comprehensive course catalog with easy assignment of instructors, rooms, and time slots",
  },
  {
    icon: Users,
    title: "Multi-User Access",
    description: "Role-based permissions for students, faculty, and administrators with customized dashboards",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated alerts for schedule changes, upcoming classes, and reservation confirmations",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Detailed insights on room utilization, attendance patterns, and resource optimization",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Powerful Features for
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Modern Campuses</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your campus scheduling efficiently and effectively
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-elegant transition-all duration-300 border-border hover:border-primary/50 group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
