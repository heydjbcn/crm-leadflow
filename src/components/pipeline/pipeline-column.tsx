"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { PipelineCard, type PipelineLead } from "./pipeline-card";

interface PipelineColumnProps {
  id: string;
  title: string;
  color: string;
  leads: PipelineLead[];
  count: number;
  totalValue?: number;
}

export function PipelineColumn({
  id,
  title,
  color,
  leads,
  count,
  totalValue,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full flex-1 min-w-0">
      {/* Header de columna */}
      <div
        className="flex items-center justify-between p-2 rounded-t-lg"
        style={{
          backgroundColor: 'var(--muted)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--border)',
          borderBottomWidth: 0
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2.5 h-2.5 rounded-full", color)} />
          <h3 className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{title}</h3>
          <span
            className="text-xs px-1 py-0 rounded-full"
            style={{ color: 'var(--muted-foreground)', backgroundColor: 'var(--accent)' }}
          >
            {count}
          </span>
        </div>
      </div>

      {/* Área de drop */}
      <div
        ref={setNodeRef}
        className="flex-1 p-1.5 rounded-b-lg overflow-y-auto transition-all min-h-[150px]"
        style={{
          backgroundColor: isOver ? 'var(--accent)' : 'var(--background)',
          borderWidth: isOver ? '2px' : '1px',
          borderStyle: 'solid',
          borderColor: isOver ? 'var(--primary)' : 'var(--border)',
          transform: isOver ? 'scale(1.01)' : 'none'
        }}
      >
        <div className="space-y-1.5">
          {leads.length === 0 ? (
            <div
              className="h-16 flex items-center justify-center text-xs border border-dashed rounded transition-all"
              style={{
                borderColor: isOver ? 'var(--primary)' : 'var(--border)',
                backgroundColor: isOver ? 'var(--accent)' : 'transparent',
                color: isOver ? 'var(--primary)' : 'var(--muted-foreground)'
              }}
            >
              {isOver ? "Soltar" : "Vacío"}
            </div>
          ) : (
            leads.map((lead) => (
              <PipelineCard key={lead.id} lead={lead} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
