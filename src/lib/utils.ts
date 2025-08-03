import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function getRoleDisplayName(roleName: string): string {
  const roleNames: Record<string, string> = {
    'SUPERUSER': 'Super Usuário',
    'MASTER': 'Master',
    'MANAGER': 'Gerente',
    'COORDINATOR': 'Coordenador',
    'USER': 'Usuário'
  }
  return roleNames[roleName] || roleName
}

export function getRoleBadgeColor(roleName: string): string {
  const colors: Record<string, string> = {
    'SUPERUSER': 'bg-purple-100 text-purple-800',
    'MASTER': 'bg-red-100 text-red-800',
    'MANAGER': 'bg-blue-100 text-blue-800',
    'COORDINATOR': 'bg-green-100 text-green-800',
    'USER': 'bg-gray-100 text-gray-800'
  }
  return colors[roleName] || 'bg-gray-100 text-gray-800'
}