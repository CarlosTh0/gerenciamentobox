
import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarViewProps {
  data: any[];
}

const CalendarView = ({ data }: CalendarViewProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

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
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
