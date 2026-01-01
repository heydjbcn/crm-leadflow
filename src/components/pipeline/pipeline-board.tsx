"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { PipelineColumn } from "./pipeline-column";
import { PipelineCard, type PipelineLead } from "./pipeline-card";
import { toast } from "sonner";

const ESTADOS = [
  { id: "nuevo", title: "Nuevo", color: "bg-blue-500" },
  { id: "contactado", title: "Contactado", color: "bg-cyan-500" },
  { id: "cualificado", title: "Cualificado", color: "bg-violet-500" },
  { id: "reunion", title: "Reunión", color: "bg-amber-500" },
  { id: "presupuestado", title: "Presupuestado", color: "bg-orange-500" },
  { id: "negociacion", title: "Negociación", color: "bg-pink-500" },
  { id: "ganado", title: "Ganado", color: "bg-emerald-500" },
  { id: "perdido", title: "Perdido", color: "bg-red-500" },
];

interface PipelineBoardProps {
  initialLeads: PipelineLead[];
  onStatusChange?: (leadId: number, newStatus: string) => Promise<void>;
}

export function PipelineBoard({ initialLeads, onStatusChange }: PipelineBoardProps) {
  const [leads, setLeads] = useState<PipelineLead[]>(initialLeads);
  const [activeLead, setActiveLead] = useState<PipelineLead | null>(null);

  // Sincronizar cuando cambian los leads iniciales
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Agrupar leads por estado
  const getLeadsByStatus = useCallback(
    (status: string) => leads.filter((lead) => lead.estado === status),
    [leads]
  );

  // Calcular valor total por columna
  const getTotalValue = useCallback(
    (status: string) => {
      return getLeadsByStatus(status).reduce((sum, lead) => {
        return sum + (Number(lead.presupuestoEnviado) || 0);
      }, 0);
    },
    [getLeadsByStatus]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    if (lead) {
      setActiveLead(lead);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as string;

    // Solo procesar si soltamos sobre una columna válida
    const targetEstado = ESTADOS.find((e) => e.id === overId);
    if (!targetEstado) return;

    const lead = leads.find((l) => l.id === activeId);
    if (!lead) return;

    // Si el estado es el mismo, no hacer nada
    if (lead.estado === overId) return;

    const estadoAnterior = lead.estado;

    // Actualizar estado local inmediatamente
    setLeads((prev) =>
      prev.map((l) =>
        l.id === activeId ? { ...l, estado: overId } : l
      )
    );

    // Hacer la llamada a la API
    try {
      if (onStatusChange) {
        await onStatusChange(activeId, overId);
      } else {
        const response = await fetch(`/api/leads/${activeId}/estado`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: overId }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar");
        }
      }

      toast.success(`Lead movido a ${targetEstado.title}`);
    } catch (error) {
      // Revertir el cambio
      setLeads((prev) =>
        prev.map((l) =>
          l.id === activeId ? { ...l, estado: estadoAnterior } : l
        )
      );
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 h-full pb-4">
        {ESTADOS.map((estado) => {
          const columnLeads = getLeadsByStatus(estado.id);
          return (
            <PipelineColumn
              key={estado.id}
              id={estado.id}
              title={estado.title}
              color={estado.color}
              leads={columnLeads}
              count={columnLeads.length}
              totalValue={getTotalValue(estado.id)}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeLead ? (
          <PipelineCard lead={activeLead} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
