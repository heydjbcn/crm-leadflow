"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface LeadsTableProps {
  leads: Lead[];
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string) => void;
  selectedLeads?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

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

const PRIORIDAD_CONFIG: Record<string, { label: string; className: string }> = {
  baja: { label: "Baja", className: "bg-slate-500/10 text-slate-500" },
  media: { label: "Media", className: "bg-blue-500/10 text-blue-500" },
  alta: { label: "Alta", className: "bg-orange-500/10 text-orange-500" },
  urgente: { label: "Urgente", className: "bg-red-500/10 text-red-500" },
};

const FUENTE_LABELS: Record<string, string> = {
  landing: "Landing",
  google_ads: "Google Ads",
  organico: "Orgánico",
  referido: "Referido",
  redes_sociales: "Redes Sociales",
  directo: "Directo",
  otro: "Otro",
};

export function LeadsTable({
  leads,
  onDelete,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  selectedLeads: externalSelectedLeads,
  onSelectionChange,
}: LeadsTableProps) {
  const [internalSelectedLeads, setInternalSelectedLeads] = useState<number[]>([]);

  // Usar estado externo si se proporciona, sino usar interno
  const selectedLeads = externalSelectedLeads ?? internalSelectedLeads;
  const setSelectedLeads = (ids: number[]) => {
    if (onSelectionChange) {
      onSelectionChange(ids);
    } else {
      setInternalSelectedLeads(ids);
    }
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => {
    const isActive = sortBy === column;
    return (
      <button
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onSort?.(column)}
      >
        {children}
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </button>
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: number) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((i) => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
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
      <div className="border rounded-lg">
        <div className="p-8 text-center text-muted-foreground">
          Cargando leads...
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No se encontraron leads</p>
          <Button asChild>
            <Link href="/leads/nuevo">Crear primer lead</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-10 px-4">
              <Checkbox
                checked={selectedLeads.length === leads.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead className="px-4">
              <SortableHeader column="nombre">Nombre</SortableHeader>
            </TableHead>
            <TableHead className="hidden sm:table-cell px-4">
              <SortableHeader column="telefono">Teléfono</SortableHeader>
            </TableHead>
            <TableHead className="hidden md:table-cell px-4">
              <SortableHeader column="email">Email</SortableHeader>
            </TableHead>
            <TableHead className="hidden lg:table-cell px-4">
              <SortableHeader column="localidad">Localidad</SortableHeader>
            </TableHead>
            <TableHead className="px-4">
              <SortableHeader column="estado">Estado</SortableHeader>
            </TableHead>
            <TableHead className="hidden xl:table-cell px-4">
              <SortableHeader column="fuente">Fuente</SortableHeader>
            </TableHead>
            <TableHead className="hidden xl:table-cell px-4">
              <SortableHeader column="presupuestoEnviado">Presupuesto</SortableHeader>
            </TableHead>
            <TableHead className="hidden xl:table-cell px-4">
              <SortableHeader column="importeVenta">Venta</SortableHeader>
            </TableHead>
            <TableHead className="hidden lg:table-cell px-4">
              <SortableHeader column="createdAt">Fecha</SortableHeader>
            </TableHead>
            <TableHead className="w-10 px-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const estadoConfig = ESTADO_CONFIG[lead.estado] || {
              label: lead.estado,
              className: "bg-gray-500/10 text-gray-500",
            };
            const prioridadConfig = PRIORIDAD_CONFIG[lead.prioridad];

            return (
              <TableRow
                key={lead.id}
                className="group hover:bg-muted/30 transition-colors"
              >
                <TableCell className="px-4">
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => toggleSelectLead(lead.id)}
                  />
                </TableCell>
                <TableCell className="px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {lead.nombre}
                    </Link>
                    {lead.prioridad !== "media" && prioridadConfig && (
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 ${prioridadConfig.className}`}
                      >
                        {prioridadConfig.label}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell px-4">
                  <a
                    href={`tel:${lead.telefono}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {lead.telefono}
                  </a>
                </TableCell>
                <TableCell className="hidden md:table-cell px-4">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell px-4">
                  <span className="text-muted-foreground">
                    {lead.localidad || "-"}
                  </span>
                </TableCell>
                <TableCell className="px-4">
                  <Badge
                    variant="outline"
                    className={estadoConfig.className}
                  >
                    {estadoConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="hidden xl:table-cell px-4">
                  <div>
                    <span className="text-muted-foreground">
                      {FUENTE_LABELS[lead.fuente] || lead.fuente}
                    </span>
                    {lead.landing && (
                      <span className="block text-xs text-muted-foreground/70">
                        {lead.landing.nombre}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell px-4">
                  <span>{formatCurrency(lead.presupuestoEnviado)}</span>
                </TableCell>
                <TableCell className="hidden xl:table-cell px-4">
                  <span
                    className={lead.importeVenta ? "text-emerald-600 font-medium" : ""}
                  >
                    {formatCurrency(lead.importeVenta)}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell px-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}/editar`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete?.(lead.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    </TooltipProvider>
  );
}
