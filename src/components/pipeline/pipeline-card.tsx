"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { GripVertical, Phone, Euro, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PipelineLead {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string;
  localidad: string | null;
  estado: string;
  fuente: string;
  prioridad: string;
  presupuestoEnviado: number | null;
  importeVenta: number | null;
  createdAt: string;
  landing?: {
    nombre: string;
  } | null;
}

interface PipelineCardProps {
  lead: PipelineLead;
  isDragOverlay?: boolean;
}

const PRIORIDAD_CONFIG: Record<string, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  urgente: { label: "Urgente", className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const FUENTE_COLORS: Record<string, string> = {
  landing: "bg-blue-500",
  google_ads: "bg-green-500",
  organico: "bg-purple-500",
  referido: "bg-amber-500",
  redes_sociales: "bg-pink-500",
  directo: "bg-slate-500",
  otro: "bg-gray-500",
};

export function PipelineCard({ lead, isDragOverlay = false }: PipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const prioridadConfig = PRIORIDAD_CONFIG[lead.prioridad];
  const fuenteColor = FUENTE_COLORS[lead.fuente] || "bg-gray-500";

  const cardContent = (
    <>
      {/* Header con nombre y prioridad */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <h4 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
          {lead.nombre}
        </h4>
        {prioridadConfig && (
          <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1",
            lead.prioridad === 'urgente' ? 'bg-red-500' : 'bg-orange-500'
          )} />
        )}
      </div>

      {/* Info compacta */}
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        <Phone className="h-3 w-3 shrink-0" />
        <span className="truncate">{lead.telefono}</span>
      </div>

      {/* Presupuesto o venta */}
      {(lead.presupuestoEnviado || lead.importeVenta) && (
        <div className="flex items-center gap-2 text-xs mt-1">
          <Euro className="h-3 w-3 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          {lead.importeVenta ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {formatCurrency(lead.importeVenta)}
            </span>
          ) : (
            <span style={{ color: 'var(--muted-foreground)' }}>
              {formatCurrency(lead.presupuestoEnviado)}
            </span>
          )}
        </div>
      )}

      {/* Footer mínimo */}
      <div
        className="flex items-center justify-between text-xs pt-1 mt-1"
        style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}
      >
        <span className={cn("w-2 h-2 rounded-full", fuenteColor)} />
        <span>
          {formatDistanceToNow(new Date(lead.createdAt), {
            addSuffix: false,
            locale: es,
          })}
        </span>
      </div>
    </>
  );

  // Si es el overlay, no necesita ref ni eventos
  if (isDragOverlay) {
    return (
      <div
        className="rounded-lg shadow-lg p-2 min-w-[150px]"
        style={{
          backgroundColor: 'var(--card)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border)'
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: 'var(--card)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border)'
      }}
      className={cn(
        "group relative rounded-lg shadow-sm transition-all",
        isDragging ? "opacity-50 shadow-lg ring-2 ring-primary z-50" : "hover:shadow-md"
      )}
    >
      {/* Handle de arrastre - toda la tarjeta es draggable */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
      />

      {/* Icono de arrastre visible en hover */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        <GripVertical className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
      </div>

      <div className="p-2 pl-4 relative z-0" style={{ color: 'var(--card-foreground)' }}>
        {cardContent}
      </div>

      {/* Link para ir al detalle - solo activo cuando no se arrastra */}
      <Link
        href={`/leads/${lead.id}`}
        className="absolute inset-0 z-5"
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
          }
        }}
      />
    </div>
  );
}
