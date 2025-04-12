
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Format date to locale string
export function formatDate(date: Date, format: string = 'short'): string {
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' 
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  
  return new Date(date).toLocaleDateString('pt-BR', options);
}

// Format currency to BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength 
    ? `${text.substring(0, maxLength)}...` 
    : text;
}

// Get status color based on status name
export function getStatusColor(status: string): {bg: string, text: string} {
  switch (status.toLowerCase()) {
    case 'concluído':
    case 'concluido':
    case 'finalizado':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'em andamento':
    case 'iniciado':
      return { bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'aguardando':
    case 'pendente':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'cancelado':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

// Calculate time difference between two dates in a human-readable format
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return `${diff} segundos atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutos atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} horas atrás`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} dias atrás`;
  return formatDate(date, 'short');
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Extract initials from a name
export function getInitials(name: string): string {
  if (!name) return '';
  
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}
