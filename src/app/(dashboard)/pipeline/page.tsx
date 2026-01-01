"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { List, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineBoard, type PipelineLead } from "@/components/pipeline";
import { CreateLeadDialog } from "@/components/leads";
import { toast } from "sonner";

export default function PipelinePage() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeads = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // Obtener todos los leads sin paginación para el kanban
      const response = await fetch("/api/leads?limit=1000");
      if (!response.ok) throw new Error("Error al cargar leads");

      const data = await response.json();
      setLeads(data.leads);
    } catch (error) {
      toast.error("Error al cargar los leads");
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    // Si es ganado, necesitamos manejar el importe
    if (newStatus === "ganado") {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && !lead.importeVenta && !lead.presupuestoEnviado) {
        toast.error("Abre el detalle del lead para cerrar la venta con el importe");
        throw new Error("Requiere importe");
      }
    }

    const response = await fetch(`/api/leads/${leadId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar");
    }

    // Actualizar el estado local
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, estado: newStatus } : lead
      )
    );
  };

  // Calcular estadísticas
  const stats = {
    total: leads.length,
    activos: leads.filter((l) => !["ganado", "perdido"].includes(l.estado)).length,
    ganados: leads.filter((l) => l.estado === "ganado").length,
    perdidos: leads.filter((l) => l.estado === "perdido").length,
    valorPipeline: leads
      .filter((l) => !["ganado", "perdido"].includes(l.estado))
      .reduce((sum, l) => sum + (Number(l.presupuestoEnviado) || 0), 0),
    valorGanado: leads
      .filter((l) => l.estado === "ganado")
      .reduce((sum, l) => sum + (Number(l.importeVenta) || 0), 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Pipeline</h1>
          <p className="text-muted-foreground">
            Arrastra los leads entre columnas para cambiar su estado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchLeads(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/leads">
              <List className="h-4 w-4" />
            </Link>
          </Button>
          <CreateLeadDialog onCreated={() => fetchLeads(true)} />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Leads Activos</p>
          <p className="text-xl font-semibold">{stats.activos}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Valor Pipeline</p>
          <p className="text-xl font-semibold">{formatCurrency(stats.valorPipeline)}</p>
        </div>
        <div className="bg-emerald-500/10 rounded-lg p-3">
          <p className="text-xs text-emerald-600">Ganados</p>
          <p className="text-xl font-semibold text-emerald-600">{stats.ganados}</p>
        </div>
        <div className="bg-emerald-500/10 rounded-lg p-3">
          <p className="text-xs text-emerald-600">Ventas</p>
          <p className="text-xl font-semibold text-emerald-600">
            {formatCurrency(stats.valorGanado)}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <PipelineBoard initialLeads={leads} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}
