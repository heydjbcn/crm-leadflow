"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Euro,
  Percent,
  Edit,
  Trash2,
  MessageSquare,
  PhoneCall,
  Video,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Lead {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string;
  localidad: string | null;
  direccion: string | null;
  servicios: string[];
  estado: string;
  fuente: string;
  prioridad: string;
  presupuestoEnviado: number | null;
  importeVenta: number | null;
  comisionCalculada: number | null;
  comisionPagada: boolean;
  notas: string | null;
  fechaPresupuesto: string | null;
  fechaVenta: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  updatedAt: string;
  landing?: {
    id: number;
    nombre: string;
    slug: string;
  } | null;
  actividades: Actividad[];
}

interface Actividad {
  id: number;
  tipo: string;
  descripcion: string;
  estadoAnterior: string | null;
  estadoNuevo: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const ESTADOS = [
  { value: "nuevo", label: "Nuevo", color: "bg-blue-500" },
  { value: "contactado", label: "Contactado", color: "bg-cyan-500" },
  { value: "cualificado", label: "Cualificado", color: "bg-violet-500" },
  { value: "reunion", label: "Reunión", color: "bg-amber-500" },
  { value: "presupuestado", label: "Presupuestado", color: "bg-orange-500" },
  { value: "negociacion", label: "Negociación", color: "bg-pink-500" },
  { value: "ganado", label: "Ganado", color: "bg-emerald-500" },
  { value: "perdido", label: "Perdido", color: "bg-red-500" },
];

const ESTADO_CONFIG: Record<string, { label: string; className: string }> = {
  nuevo: { label: "Nuevo", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  contactado: { label: "Contactado", className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  cualificado: { label: "Cualificado", className: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  reunion: { label: "Reunión", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  presupuestado: { label: "Presupuestado", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  negociacion: { label: "Negociación", className: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  ganado: { label: "Ganado", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  perdido: { label: "Perdido", className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const TIPO_ACTIVIDAD_ICON: Record<string, React.ReactNode> = {
  nota: <MessageSquare className="h-4 w-4" />,
  llamada: <PhoneCall className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  reunion: <Video className="h-4 w-4" />,
  whatsapp: <MessageSquare className="h-4 w-4" />,
  presupuesto_enviado: <FileText className="h-4 w-4" />,
  presupuesto_actualizado: <FileText className="h-4 w-4" />,
  creacion: <CheckCircle2 className="h-4 w-4" />,
  cambio_estado: <ChevronRight className="h-4 w-4" />,
  venta_cerrada: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  venta_perdida: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ganadorDialogOpen, setGanadorDialogOpen] = useState(false);
  const [importeVenta, setImporteVenta] = useState("");

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Lead no encontrado");
          router.push("/leads");
          return;
        }
        throw new Error("Error al cargar el lead");
      }
      const data = await response.json();
      setLead(data);
    } catch (error) {
      toast.error("Error al cargar el lead");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleEstadoChange = async (nuevoEstado: string) => {
    if (!lead) return;

    // Si es ganado, abrir dialog para importe
    if (nuevoEstado === "ganado") {
      setGanadorDialogOpen(true);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/leads/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error("Error al actualizar estado");

      toast.success(`Estado actualizado a ${ESTADO_CONFIG[nuevoEstado]?.label}`);
      fetchLead();
    } catch (error) {
      toast.error("Error al actualizar el estado");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGanadorConfirm = async () => {
    if (!lead) return;

    const importe = parseFloat(importeVenta);
    if (isNaN(importe) || importe <= 0) {
      toast.error("Introduce un importe válido");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/leads/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "ganado",
          importeVenta: importe,
        }),
      });

      if (!response.ok) throw new Error("Error al actualizar estado");

      toast.success("¡Venta cerrada! Comisión calculada automáticamente");
      setGanadorDialogOpen(false);
      setImporteVenta("");
      fetchLead();
    } catch (error) {
      toast.error("Error al cerrar la venta");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !lead) return;

    setIsAddingNote(true);
    try {
      const response = await fetch(`/api/leads/${id}/actividad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "nota",
          descripcion: newNote.trim(),
        }),
      });

      if (!response.ok) throw new Error("Error al añadir nota");

      toast.success("Nota añadida");
      setNewNote("");
      fetchLead();
    } catch (error) {
      toast.error("Error al añadir la nota");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast.success("Lead eliminado");
      router.push("/leads");
    } catch (error) {
      toast.error("Error al eliminar el lead");
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  const estadoConfig = ESTADO_CONFIG[lead.estado];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/leads">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{lead.nombre}</h1>
              <Badge variant="outline" className={estadoConfig?.className}>
                {estadoConfig?.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Creado {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-12 sm:ml-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/leads/${id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cambiar estado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ESTADOS.map((estado) => (
                  <Button
                    key={estado.value}
                    variant={lead.estado === estado.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEstadoChange(estado.value)}
                    disabled={isUpdating || lead.estado === estado.value}
                    className="gap-2"
                  >
                    <span className={`w-2 h-2 rounded-full ${estado.color}`} />
                    {estado.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline de actividades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Añadir nota */}
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Añadir una nota..."
                  className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim() || isAddingNote}
              >
                {isAddingNote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Añadir nota
              </Button>

              <Separator />

              {/* Lista de actividades */}
              <div className="space-y-4">
                {lead.actividades.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No hay actividades registradas
                  </p>
                ) : (
                  lead.actividades.map((actividad) => (
                    <div key={actividad.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {TIPO_ACTIVIDAD_ICON[actividad.tipo] || (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{actividad.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(actividad.createdAt), "d MMM yyyy, HH:mm", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar derecha */}
        <div className="space-y-6">
          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {lead.nombre.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{lead.nombre}</p>
                  {lead.localidad && (
                    <p className="text-sm text-muted-foreground">{lead.localidad}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <a
                  href={`tel:${lead.telefono}`}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {lead.telefono}
                </a>
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {lead.email}
                  </a>
                )}
                {lead.direccion && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    {lead.direccion}
                  </div>
                )}
              </div>

              {lead.servicios && lead.servicios.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Servicios</p>
                    <div className="flex flex-wrap gap-1">
                      {lead.servicios.map((servicio, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {servicio}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {lead.notas && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Notas</p>
                    <p className="text-sm text-muted-foreground">{lead.notas}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información Financiera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Presupuesto
                </div>
                <span className="font-medium">
                  {formatCurrency(lead.presupuestoEnviado)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  Venta
                </div>
                <span className={`font-medium ${lead.importeVenta ? "text-emerald-600" : ""}`}>
                  {formatCurrency(lead.importeVenta)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Percent className="h-4 w-4" />
                  Comisión (10%)
                </div>
                <span className={`font-semibold ${lead.comisionCalculada ? "text-primary" : ""}`}>
                  {formatCurrency(lead.comisionCalculada)}
                </span>
              </div>
              {lead.comisionCalculada && (
                <Badge
                  variant={lead.comisionPagada ? "default" : "secondary"}
                  className="w-full justify-center"
                >
                  {lead.comisionPagada ? "Comisión pagada" : "Pendiente de cobro"}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Datos de origen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Origen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fuente</span>
                <span className="capitalize">{lead.fuente.replace("_", " ")}</span>
              </div>
              {lead.landing && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Landing</span>
                  <span>{lead.landing.nombre}</span>
                </div>
              )}
              {lead.utmSource && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTM Source</span>
                  <span>{lead.utmSource}</span>
                </div>
              )}
              {lead.utmMedium && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTM Medium</span>
                  <span>{lead.utmMedium}</span>
                </div>
              )}
              {lead.utmCampaign && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTM Campaign</span>
                  <span>{lead.utmCampaign}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creado</span>
                <span>
                  {format(new Date(lead.createdAt), "d MMM yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actualizado</span>
                <span>
                  {format(new Date(lead.updatedAt), "d MMM yyyy", { locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog confirmar eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Lead</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {lead.nombre}? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para marcar como ganado */}
      <Dialog open={ganadorDialogOpen} onOpenChange={setGanadorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Venta</DialogTitle>
            <DialogDescription>
              Introduce el importe final de la venta para calcular tu comisión del
              10%.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="importeVenta">Importe de venta</Label>
            <div className="relative mt-2">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="importeVenta"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={importeVenta}
                onChange={(e) => setImporteVenta(e.target.value)}
                className="pl-10"
              />
            </div>
            {importeVenta && !isNaN(parseFloat(importeVenta)) && (
              <p className="text-sm text-muted-foreground mt-2">
                Comisión estimada:{" "}
                <span className="font-medium text-primary">
                  {formatCurrency(parseFloat(importeVenta) * 0.1)}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGanadorDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGanadorConfirm} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cerrar Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
