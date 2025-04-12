
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AgendaFormProps {
  onSave: (appointment: any) => void;
  onCancel: () => void;
  selectedDate: Date;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const serviceTypes = [
  'Troca de Óleo',
  'Revisão Completa',
  'Troca de Pneus',
  'Alinhamento e Balanceamento',
  'Sistema Elétrico',
  'Motor',
  'Freios',
  'Ar-condicionado',
  'Outro'
];

const AgendaForm = ({ onSave, onCancel, selectedDate }: AgendaFormProps) => {
  const [appointment, setAppointment] = useState({
    client: '',
    phone: '',
    vehicle: '',
    plate: '',
    service: '',
    date: selectedDate,
    time: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name: string, value: string) => {
    setAppointment(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setAppointment(prev => ({ ...prev, date }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(appointment);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client">Nome do Cliente</Label>
          <Input
            id="client"
            name="client"
            value={appointment.client}
            onChange={handleChange}
            placeholder="Nome completo"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={appointment.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle">Veículo</Label>
          <Input
            id="vehicle"
            name="vehicle"
            value={appointment.vehicle}
            onChange={handleChange}
            placeholder="Marca / Modelo / Ano"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="plate">Placa</Label>
          <Input
            id="plate"
            name="plate"
            value={appointment.plate}
            onChange={handleChange}
            placeholder="ABC-1234"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Serviço</Label>
          <Select
            value={appointment.service}
            onValueChange={(value) => handleSelect('service', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar serviço" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {appointment.date ? (
                  format(appointment.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={appointment.date}
                onSelect={handleDateChange}
                initialFocus
                locale={ptBR}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Horário</Label>
          <Select
            value={appointment.time}
            onValueChange={(value) => handleSelect('time', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar horário">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{appointment.time || "Selecionar horário"}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          value={appointment.notes}
          onChange={handleChange}
          placeholder="Informações adicionais sobre o serviço"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Agendar Serviço
        </Button>
      </div>
    </form>
  );
};

export default AgendaForm;
