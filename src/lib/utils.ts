import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma segura
 * Evita conflictos entre clases usando tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Formatea una fecha en español
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Ahora mismo";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return formatDate(d);
}

/**
 * Genera un color de fondo para un estado del pipeline
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    nuevo: "bg-[var(--status-nuevo)]",
    contactado: "bg-[var(--status-contactado)]",
    cualificado: "bg-[var(--status-cualificado)]",
    reunion: "bg-[var(--status-reunion)]",
    presupuestado: "bg-[var(--status-presupuestado)]",
    negociacion: "bg-[var(--status-negociacion)]",
    ganado: "bg-[var(--status-ganado)]",
    perdido: "bg-[var(--status-perdido)]",
  };
  return colors[status] || "bg-muted";
}

/**
 * Traduce el estado del pipeline al español
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    nuevo: "Nuevo",
    contactado: "Contactado",
    cualificado: "Cualificado",
    reunion: "Reunión",
    presupuestado: "Presupuestado",
    negociacion: "Negociación",
    ganado: "Ganado",
    perdido: "Perdido",
  };
  return labels[status] || status;
}

/**
 * Traduce la fuente del lead al español
 */
export function getFuenteLabel(fuente: string): string {
  const labels: Record<string, string> = {
    landing: "Landing",
    google_ads: "Google Ads",
    organico: "Orgánico",
    referido: "Referido",
    redes_sociales: "Redes Sociales",
    directo: "Directo",
    otro: "Otro",
  };
  return labels[fuente] || fuente;
}

/**
 * Genera iniciales de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calcula la comisión (10% por defecto)
 */
export function calculateCommission(amount: number, percentage: number = 10): number {
  return amount * (percentage / 100);
}

/**
 * Genera una API Key aleatoria
 */
export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "sk_live_";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Trunca un texto a una longitud máxima
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Formatea un número de teléfono español
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.startsWith("34") && cleaned.length === 11) {
    return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}
