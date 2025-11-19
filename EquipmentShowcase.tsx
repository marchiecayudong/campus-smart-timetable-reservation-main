import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import projectorImg from "@/assets/equipment/projector.jpg";
import laptopImg from "@/assets/equipment/laptop.jpg";
import microscopeImg from "@/assets/equipment/microscope.jpg";
import cameraImg from "@/assets/equipment/camera.jpg";
import whiteboardImg from "@/assets/equipment/whiteboard.jpg";
import speakersImg from "@/assets/equipment/speakers.jpg";

const equipment = [
  {
    id: 1,
    name: "Projector",
    image: projectorImg,
    category: "Presentation",
    available: 12,
    description: "High-definition projectors for lectures and presentations",
  },
  {
    id: 2,
    name: "Laptop",
    image: laptopImg,
    category: "Computing",
    available: 25,
    description: "Modern laptops for student projects and coursework",
  },
  {
    id: 3,
    name: "Microscope",
    image: microscopeImg,
    category: "Laboratory",
    available: 8,
    description: "Advanced microscopes for science labs and research",
  },
  {
    id: 4,
    name: "Video Camera",
    image: cameraImg,
    category: "Media",
    available: 5,
    description: "Professional cameras for media and film projects",
  },
  {
    id: 5,
    name: "Smart Whiteboard",
    image: whiteboardImg,
    category: "Presentation",
    available: 6,
    description: "Interactive digital whiteboards for collaborative learning",
  },
  {
    id: 6,
    name: "Audio System",
    image: speakersImg,
    category: "Audio",
    available: 10,
    description: "Premium sound systems for events and presentations",
  },
];

const reservationSchema = z.object({
  reservationDate: z.string()
    .min(1, "Date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Date must be today or in the future"),
  timeSlot: z.string()
    .min(1, "Time slot is required")
    .max(50, "Time slot must be less than 50 characters"),
  notes: z.string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .transform(val => val?.trim() || "")
});

const EquipmentShowcase = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<typeof equipment[0] | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reservationDate, setReservationDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      
      // Check if user is a student
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      
      setIsStudent(roles?.some(r => r.role === "student") || false);
    }
  };

  const handleReserve = (item: typeof equipment[0]) => {
    if (!user) {
      toast.error("Please sign in to make a reservation");
      navigate("/auth");
      return;
    }
    
    if (!isStudent) {
      toast.error("Only students can make equipment reservations");
      return;
    }
    
    setSelectedItem(item);
  };

  const handleSubmitReservation = async () => {
    // Validate inputs
    const validationResult = reservationSchema.safeParse({
      reservationDate,
      timeSlot,
      notes
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);
    try {
      const validatedData = validationResult.data;
      
      const { error } = await supabase
        .from("equipment_reservations")
        .insert({
          student_id: user.id,
          equipment_name: selectedItem?.name,
          equipment_category: selectedItem?.category,
          reservation_date: validatedData.reservationDate,
          time_slot: validatedData.timeSlot,
          notes: validatedData.notes || null,
        });

      if (error) throw error;

      toast.success("Reservation request submitted! Staff will review your request.");
      setSelectedItem(null);
      setReservationDate("");
      setTimeSlot("");
      setNotes("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Reserve School
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"> Equipment</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse and reserve essential campus equipment with just a few clicks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipment.map((item) => (
            <Card 
              key={item.id}
              className="group overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elegant cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="aspect-square overflow-hidden bg-secondary/50">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {item.category}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${item.available > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>{item.available} available</span>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="group-hover:shadow-glow transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReserve(item);
                    }}
                  >
                    Reserve Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Reserve {selectedItem?.name}</DialogTitle>
            <DialogDescription>
              Fill in the details below to reserve this equipment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary/50">
              <img 
                src={selectedItem?.image} 
                alt={selectedItem?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Reservation Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time Slot</Label>
                <Input
                  id="time"
                  type="time"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-md text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Pickup location: Campus Equipment Center
                </span>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleSubmitReservation}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Reservation
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => setSelectedItem(null)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EquipmentShowcase;
