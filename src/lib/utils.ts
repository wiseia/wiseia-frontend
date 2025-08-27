// ARQUIVO FINAL E COMPLETO: src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de dados
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  } catch (error) {
    return 'Data inválida';
  }
}

// ### A FUNÇÃO QUE ESTAVA FALTANDO ###
export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Cores baseadas no role
export function getRoleColor(roleName: string): string {
  const colors: { [key: string]: string } = {
    SUPERUSUARIO: 'bg-purple-100 text-purple-800',
    MASTER: 'bg-blue-100 text-blue-800',
    MANAGER: 'bg-green-100 text-green-800',
    COORDINATOR: 'bg-yellow-100 text-yellow-800',
    USER: 'bg-gray-100 text-gray-800'
  };
  return colors[roleName] || colors.USER;
}