
import React from 'react';
import { Clock, Calendar, Car, User, Phone, Edit, Trash, FilePenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onConvertToOS: (id: string) => void;
}

const AppointmentList = ({ appointments, onEdit, onDelete, onConvertToOS }: AppointmentListProps) => {
  const sortedAppointments = [...appointments].sort((a, b) => {
    // Primeiro ordenar por horário
    return a.time.localeCompare(b.time);
  });

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">Sem agendamentos</h3>
        <p className="text-gray-500 mt-2">
          Não há agendamentos para esta data. Utilize o botão acima para agendar um novo serviço.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedAppointments.map((appointment) => (
        <Card key={appointment.id} className="overflow-hidden">
          <div className="bg-mechanic-800 py-1 px-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-white">
                <Clock size={16} />
                <span className="font-medium">{appointment.time}</span>
              </div>
              <Badge variant="outline" className="bg-white text-mechanic-800">
                {appointment.service}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User size={16} />
                  <span className="font-medium">{appointment.client}</span>
                </div>
                
                {appointment.phone && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Phone size={16} />
                    <span>{appointment.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Car size={16} />
                  <span className="font-medium">{appointment.vehicle}</span>
                  {appointment.plate && <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">
                    {appointment.plate}
                  </span>}
                </div>
              </div>
            </div>
            
            {appointment.notes && (
              <>
                <Separator className="my-3" />
                <p className="text-sm text-gray-600">{appointment.notes}</p>
              </>
            )}
            
            <Separator className="my-3" />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-gray-700"
                onClick={() => onEdit(appointment.id)}
              >
                <Edit size={14} className="mr-1" />
                Editar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:border-red-600"
                onClick={() => onDelete(appointment.id)}
              >
                <Trash size={14} className="mr-1" />
                Excluir
              </Button>
              
              <Button
                variant="default"
                size="sm"
                className="h-8 px-2 bg-mechanic-700 hover:bg-mechanic-800"
                onClick={() => onConvertToOS(appointment.id)}
              >
                <FilePenLine size={14} className="mr-1" />
                Criar OS
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentList;
