import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isToday, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AgendaForm from '@/components/agenda/AgendaForm';
import AppointmentList from '@/components/agenda/AppointmentList';
import { generateUniqueId } from '@/lib/utils';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  client: string;
  phone: string;
  vehicle: string;
  plate: string;
  service: string;
  date: Date;
  time: string;
  notes: string;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    client: 'João Silva',
    phone: '(11) 99999-8888',
    vehicle: 'Honda Civic 2020',
    plate: 'ABC-1234',
    service: 'Troca de Óleo',
    date: new Date(),
    time: '09:00',
    notes: 'Cliente solicitou checagem dos freios também.'
  },
  {
    id: '2',
    client: 'Maria Oliveira',
    phone: '(11) 97777-6666',
    vehicle: 'Toyota Corolla 2018',
    plate: 'DEF-5678',
    service: 'Revisão Completa',
    date: new Date(),
    time: '14:30',
    notes: ''
  },
  {
    id: '3',
    client: 'Carlos Pereira',
    phone: '(11) 95555-4444',
    vehicle: 'Volkswagen Gol 2015',
    plate: 'GHI-9012',
    service: 'Alinhamento e Balanceamento',
    date: addDays(new Date(), 1),
    time: '10:00',
    notes: 'Veículo tem apresentado vibração em alta velocidade.'
  }
];

const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
};

const AgendaPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const weekDays = getWeekDays(selectedDate);
  
  const filteredAppointments = appointments.filter(app => 
    isSameDay(new Date(app.date), selectedDate)
  );
  
  const handleAddAppointment = () => {
    setEditingId(null);
    setShowForm(true);
  };
  
  const handleSaveAppointment = (appointment: any) => {
    if (editingId) {
      setAppointments(appointments.map(app => 
        app.id === editingId ? { ...appointment, id: editingId } : app
      ));
      toast.success("Agendamento atualizado com sucesso!");
    } else {
      const newAppointment = {
        ...appointment,
        id: generateUniqueId()
      };
      setAppointments([...appointments, newAppointment]);
      toast.success("Novo agendamento criado com sucesso!");
    }
    setShowForm(false);
    setEditingId(null);
  };
  
  const handleEditAppointment = (id: string) => {
    const appointmentToEdit = appointments.find(app => app.id === id);
    if (appointmentToEdit) {
      setEditingId(id);
      setShowForm(true);
    }
  };
  
  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(app => app.id !== id));
    toast.success("Agendamento removido com sucesso!");
  };
  
  const handleConvertToOS = (id: string) => {
    toast.success("Funcionalidade de criação de OS será implementada em breve!");
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
        <Button onClick={handleAddAppointment}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Agendamento
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Calendário de Serviços</CardTitle>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 w-10 p-0">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSelectedDate(new Date())}
              >
                <span className="sr-only">Ir para hoje</span>
                <span className="text-xs font-medium">Hoje</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-semibold">
              {format(selectedDate, "'Semana de' dd 'de' MMMM", { locale: ptBR })}
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((date, i) => {
              const dayHasAppointments = appointments.some(app => 
                isSameDay(new Date(app.date), date)
              );
              
              return (
                <div 
                  key={i}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors",
                    isSameDay(date, selectedDate) && "bg-mechanic-100 border border-mechanic-300",
                    isToday(date) && "font-bold"
                  )}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="text-xs text-gray-500">
                    {format(date, 'EEE', { locale: ptBR })}
                  </span>
                  <span className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full mt-1",
                    isToday(date) && "bg-mechanic-700 text-white"
                  )}>
                    {format(date, 'd')}
                  </span>
                  {dayHasAppointments && (
                    <div className="w-1 h-1 bg-mechanic-500 rounded-full mt-1" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            
            {showForm ? (
              <AgendaForm 
                onSave={handleSaveAppointment} 
                onCancel={handleCancelForm}
                selectedDate={selectedDate} 
              />
            ) : (
              <AppointmentList 
                appointments={filteredAppointments}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
                onConvertToOS={handleConvertToOS}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaPage;
