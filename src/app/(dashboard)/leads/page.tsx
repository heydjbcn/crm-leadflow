"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, LayoutGrid, List, Loader2, Trash2, RefreshCw, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LeadsFilters,
  LeadsTable,
  LeadsPagination,
  CreateLeadDialog,
} from "@/components/leads";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Lead {
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
    id: number;
    nombre: string;
    slug: string;
  } | null;
  _count?: {
    actividades: number;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function LeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<number | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Obtener filtros de URL
  const getFiltersFromURL = useCallback(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      filters[key] = value;
    });
    return filters;
  }, [searchParams]);

  // Cargar leads
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.has("page")) params.set("page", "1");
      if (!params.has("limit")) params.set("limit", "20");

      const response = await fetch(`/api/leads?${params.toString()}`);
      if (!response.ok) throw new Error("Error al cargar leads");

      const data = await response.json();
      setLeads(data.leads);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Error al cargar los leads");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Actualizar URL con filtros
  const updateURL = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Resetear página al cambiar filtros (excepto cuando se cambia la página)
    if (!("page" in updates)) {
      params.set("page", "1");
    }

    router.push(`/leads?${params.toString()}`);
  };

  // Manejar cambio de filtros
  const handleFiltersChange = (filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", "1");
    params.set("limit", pagination.limit.toString());
    router.push(`/leads?${params.toString()}`);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  // Manejar cambio de límite
  const handleLimitChange = (limit: number) => {
    updateURL({ limit, page: 1 });
  };

  // Manejar ordenación
  const handleSort = (column: string) => {
    const currentOrden = searchParams.get("orden") || "createdAt";
    const currentDireccion = searchParams.get("direccion") || "desc";

    let newDireccion: string;
    if (currentOrden === column) {
      newDireccion = currentDireccion === "desc" ? "asc" : "desc";
    } else {
      newDireccion = "desc";
    }

    updateURL({ orden: column, direccion: newDireccion, page: 1 });
  };

  // Manejar eliminación
  const handleDeleteClick = (id: number) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    try {
      const response = await fetch(`/api/leads/${leadToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast.success("Lead eliminado correctamente");
      fetchLeads();
    } catch (error) {
      toast.error("Error al eliminar el lead");
    } finally {
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  // Acciones masivas
  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    setIsBulkLoading(true);

    try {
      const response = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedLeads,
          action: "delete",
        }),
      });

      if (!response.ok) throw new Error("Error al eliminar");

      const data = await response.json();
      toast.success(data.message);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      toast.error("Error al eliminar los leads");
    } finally {
      setIsBulkLoading(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedLeads.length === 0) return;
    setIsBulkLoading(true);

    try {
      const response = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedLeads,
          action: "updateStatus",
          value: status,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      const data = await response.json();
      toast.success(data.message);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      toast.error("Error al actualizar los leads");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkPriorityChange = async (priority: string) => {
    if (selectedLeads.length === 0) return;
    setIsBulkLoading(true);

    try {
      const response = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedLeads,
          action: "updatePriority",
          value: priority,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar");

      const data = await response.json();
      toast.success(data.message);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      toast.error("Error al actualizar los leads");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleExportSelected = () => {
    const leadsToExport = selectedLeads.length > 0
      ? leads.filter((l) => selectedLeads.includes(l.id))
      : leads;

    if (leadsToExport.length === 0) {
      toast.error("No hay leads para exportar");
      return;
    }

    const headers = [
      "ID",
      "Nombre",
      "Email",
      "Teléfono",
      "Localidad",
      "Estado",
      "Fuente",
      "Prioridad",
      "Presupuesto",
      "Venta",
      "Fecha",
    ];

    const rows = leadsToExport.map((lead) => [
      lead.id,
      lead.nombre,
      lead.email || "",
      lead.telefono,
      lead.localidad || "",
      lead.estado,
      lead.fuente,
      lead.prioridad,
      lead.presupuestoEnviado || "",
      lead.importeVenta || "",
      new Date(lead.createdAt).toLocaleDateString("es-ES"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${selectedLeads.length > 0 ? "seleccionados_" : ""}${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success(`${leadsToExport.length} leads exportados`);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error("No hay leads para exportar");
      return;
    }

    const headers = [
      "ID",
      "Nombre",
      "Email",
      "Teléfono",
      "Localidad",
      "Estado",
      "Fuente",
      "Prioridad",
      "Presupuesto",
      "Venta",
      "Fecha",
    ];

    const rows = leads.map((lead) => [
      lead.id,
      lead.nombre,
      lead.email || "",
      lead.telefono,
      lead.localidad || "",
      lead.estado,
      lead.fuente,
      lead.prioridad,
      lead.presupuestoEnviado || "",
      lead.importeVenta || "",
      new Date(lead.createdAt).toLocaleDateString("es-ES"),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("CSV exportado correctamente");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <p className="text-muted-foreground">
            Gestiona todos los leads de tus landing pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
          </Button>
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => {
                setViewMode("kanban");
                router.push("/pipeline");
              }}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <CreateLeadDialog onCreated={fetchLeads} />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <LeadsFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={getFiltersFromURL()}
          />
        </CardContent>
      </Card>

      {/* Barra de acciones masivas */}
      {selectedLeads.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg">
          <span className="text-sm font-medium">
            {selectedLeads.length} lead{selectedLeads.length > 1 ? "s" : ""} seleccionado{selectedLeads.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {/* Cambiar Estado */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isBulkLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cambiar estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("nuevo")}>
                  Nuevo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("contactado")}>
                  Contactado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("cualificado")}>
                  Cualificado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("reunion")}>
                  Reunión
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("presupuestado")}>
                  Presupuestado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("negociacion")}>
                  Negociación
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("ganado")}>
                  Ganado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange("perdido")}>
                  Perdido
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cambiar Prioridad */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isBulkLoading}>
                  <Flag className="h-4 w-4 mr-2" />
                  Prioridad
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkPriorityChange("baja")}>
                  Baja
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriorityChange("media")}>
                  Media
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriorityChange("alta")}>
                  Alta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriorityChange("urgente")}>
                  Urgente
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Exportar */}
            <Button variant="outline" size="sm" onClick={handleExportSelected} disabled={isBulkLoading}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            {/* Eliminar */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={isBulkLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>

            {/* Deseleccionar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLeads([])}
              disabled={isBulkLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <LeadsTable
        leads={leads}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
        sortBy={searchParams.get("orden") || "createdAt"}
        sortOrder={(searchParams.get("direccion") as "asc" | "desc") || "desc"}
        onSort={handleSort}
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
      />

      {/* Paginación */}
      {pagination.totalPages > 0 && (
        <LeadsPagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Lead</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este lead? Esta acción no se
              puede deshacer y se eliminarán todas las actividades asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación masiva */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar {selectedLeads.length} leads</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar {selectedLeads.length} lead{selectedLeads.length > 1 ? "s" : ""}?
              Esta acción no se puede deshacer y se eliminarán todas las actividades asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={isBulkLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkLoading}
            >
              {isBulkLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadsLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsLoading />}>
      <LeadsContent />
    </Suspense>
  );
}
