import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Package, Calendar, Clock } from "lucide-react";

interface Reservation {
  id: string;
  equipment_name: string;
  equipment_category: string;
  reservation_date: string;
  time_slot: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const StudentReservations = ({ userId }: { userId: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('student-reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_reservations',
          filter: `student_id=eq.${userId}`,
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from("equipment_reservations")
        .select("*")
        .eq("student_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Reservations Yet</CardTitle>
          <CardDescription>
            You haven't made any equipment reservations. Visit the equipment showcase to get started!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {reservations.map((reservation) => (
        <Card key={reservation.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {reservation.equipment_name}
                </CardTitle>
                <CardDescription>{reservation.equipment_category}</CardDescription>
              </div>
              <Badge className={getStatusColor(reservation.status)}>
                {reservation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(reservation.reservation_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{reservation.time_slot}</span>
              </div>
              {reservation.notes && (
                <div className="mt-2 p-3 bg-secondary/50 rounded-md">
                  <p className="text-sm">{reservation.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentReservations;
