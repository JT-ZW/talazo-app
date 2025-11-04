import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calculateDaysSince(date: string | Date): number {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getHealthStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-amber-600 bg-amber-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-amber-600';
    case 'high':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export function calculatePolygonArea(coordinates: number[][]): number {
  // Simple area calculation using shoelace formula
  // Returns area in square meters (approximate)
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  area = Math.abs(area) / 2;
  
  // Convert to hectares (very rough approximation)
  // 1 degree ≈ 111km, so 1 sq degree ≈ 12,321 sq km
  return area * 12321 * 100; // Convert to hectares
}
