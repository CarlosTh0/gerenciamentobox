
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CalendarViewProps {
  data: any[];
  onAddEvent?: (newEvent: any) => void;
}

const CalendarView = ({ data, onAddEvent }: CalendarViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    HORA: "",
    VIAGEM: "",
    FROTA: "",
    PREBOX: "",
    "BOX-D": "",
    status: "LIVRE"
  });

  const handleSelect = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      const eventsOnDay = data.filter(item => {
        const itemDate = new Date();
        const [hours, minutes] = (item.HORA || "00:00").split(":");
        itemDate.setHours(parseInt(hours), parseInt(minutes));
        return itemDate.toDateString() === date.toDateString();
      });
      setSelectedEvents(eventsOnDay);
    }
  };

  const handleAddEvent = () => {
    if (onAddEvent && date) {
      onAddEvent({
        ...newEvent,
        date: date
      });
      setIsAddEventOpen(false);
      setNewEvent({
        HORA: "",
        VIAGEM: "",
        FROTA: "",
        PREBOX: "",
        "BOX-D": "",
        status: "LIVRE"
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={ptBR}
            className="rounded-md border"
          />
          {date && (
            <div className="mt-4">
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Agendamento para {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ""}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hora">Hora</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={newEvent.HORA}
                        onChange={(e) => setNewEvent({ ...newEvent, HORA: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="viagem">Viagem</Label>
                      <Input
                        id="viagem"
                        value={newEvent.VIAGEM}
                        onChange={(e) => setNewEvent({ ...newEvent, VIAGEM: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frota">Frota</Label>
                      <Input
                        id="frota"
                        value={newEvent.FROTA}
                        onChange={(e) => setNewEvent({ ...newEvent, FROTA: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prebox">Prebox</Label>
                      <Input
                        id="prebox"
                        value={newEvent.PREBOX}
                        onChange={(e) => setNewEvent({ ...newEvent, PREBOX: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="boxd">Box-D</Label>
                      <Input
                        id="boxd"
                        value={newEvent["BOX-D"]}
                        onChange={(e) => setNewEvent({ ...newEvent, "BOX-D": e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddEvent}>
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">
            Agendamentos para {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : "hoje"}
          </h3>
          <div className="space-y-2">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{event.HORA} - Viagem: {event.VIAGEM}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Detalhes do Agendamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      <p><strong>Hora:</strong> {event.HORA}</p>
                      <p><strong>Viagem:</strong> {event.VIAGEM}</p>
                      <p><strong>Frota:</strong> {event.FROTA}</p>
                      <p><strong>Prebox:</strong> {event.PREBOX}</p>
                      <p><strong>Box-D:</strong> {event["BOX-D"]}</p>
                      <p><strong>Status:</strong> {event.status}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhum agendamento para esta data.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CalendarView;
