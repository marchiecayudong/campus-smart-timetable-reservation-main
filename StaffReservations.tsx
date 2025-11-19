import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Package, Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";

interface Reservation {
  id: string;
  equipment_name: string;
  equipment_category: string;
  reservation_date: string;
  time_slot: string;
  status: string;
  notes: string | null;
  created_at: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
}

const StaffReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchReservations();

    const channel = supabase
      .channel('all-reservations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment_reservations',
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReservations = async () => {
    try {
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("equipment_reservations")
        .select("*")
        .order("created_at", { ascending: false });

      if (reservationsError) throw reservationsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      const reservationsWithProfiles = (reservationsData || []).map(reservation => {
        const profile = profilesData?.find(p => p.id === reservation.student_id);
        return {
          ...reservation,
          student_name: profile?.full_name || undefined,
          student_email: profile?.email || undefined,
        };
      });

      setReservations(reservationsWithProfiles);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const updates: any = { status };
      if (noteInputs[id]) {
        updates.notes = noteInputs[id];
      }

      const { error } = await supabase
        .from("equipment_reservations")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast.success(`Reservation ${status}!`);
      setNoteInputs((prev) => {
        const newInputs = { ...prev };
        delete newInputs[id];
        return newInputs;
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingId(null);
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
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{reservation.student_name || reservation.student_email || "Unknown"}</span>
              </div>
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

            {reservation.status === "pending" && (
              <div className="space-y-3 pt-4 border-t">
                <Textarea
                  placeholder="Add notes (optional)"
                  value={noteInputs[reservation.id] || ""}
                  onChange={(e) =>
                    setNoteInputs((prev) => ({
                      ...prev,
                      [reservation.id]: e.target.value,
                    }))
                  }
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateReservationStatus(reservation.id, "approved")}
                    disabled={updatingId === reservation.id}
                    className="flex-1"
                  >
                    {updatingId === reservation.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateReservationStatus(reservation.id, "rejected")}
                    disabled={updatingId === reservation.id}
                    className="flex-1"
                  >
                    {updatingId === reservation.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {reservation.status === "approved" && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => updateReservationStatus(reservation.id, "completed")}
                  disabled={updatingId === reservation.id}
                  className="w-full"
                >
                  {updatingId === reservation.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Mark as Completed
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StaffReservations;
