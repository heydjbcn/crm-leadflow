"use client";

import { useState } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

const FUENTES = [
  { value: "landing", label: "Landing" },
  { value: "google_ads", label: "Google Ads" },
  { value: "organico", label: "Orgánico" },
  { value: "referido", label: "Referido" },
  { value: "redes_sociales", label: "Redes Sociales" },
  { value: "directo", label: "Directo" },
  { value: "otro", label: "Otro" },
];

const PRIORIDADES = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

interface LeadsFiltersProps {
  onFiltersChange: (filters: Record<string, string>) => void;
  initialFilters?: Record<string, string>;
}

export function LeadsFilters({ onFiltersChange, initialFilters = {} }: LeadsFiltersProps) {
  const [buscar, setBuscar] = useState(initialFilters.buscar || "");
  const [estados, setEstados] = useState<string[]>(
    initialFilters.estado ? initialFilters.estado.split(",") : []
  );
  const [fuentes, setFuentes] = useState<string[]>(
    initialFilters.fuente ? initialFilters.fuente.split(",") : []
  );
  const [prioridad, setPrioridad] = useState(initialFilters.prioridad || "");

  const activeFiltersCount =
    (estados.length > 0 ? 1 : 0) +
    (fuentes.length > 0 ? 1 : 0) +
    (prioridad ? 1 : 0);

  const handleSearch = (value: string) => {
    setBuscar(value);
    applyFilters({ buscar: value });
  };

  const toggleEstado = (estado: string) => {
    const newEstados = estados.includes(estado)
      ? estados.filter((e) => e !== estado)
      : [...estados, estado];
    setEstados(newEstados);
    applyFilters({ estado: newEstados.join(",") });
  };

  const toggleFuente = (fuente: string) => {
    const newFuentes = fuentes.includes(fuente)
      ? fuentes.filter((f) => f !== fuente)
      : [...fuentes, fuente];
    setFuentes(newFuentes);
    applyFilters({ fuente: newFuentes.join(",") });
  };

  const handlePrioridadChange = (value: string) => {
    const newPrioridad = value === "todas" ? "" : value;
    setPrioridad(newPrioridad);
    applyFilters({ prioridad: newPrioridad });
  };

  const applyFilters = (updates: Record<string, string>) => {
    const newFilters = {
      buscar,
      estado: estados.join(","),
      fuente: fuentes.join(","),
      prioridad,
      ...updates,
    };

    // Limpiar filtros vacíos
    const cleanFilters: Record<string, string> = {};
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) cleanFilters[key] = value;
    });

    onFiltersChange(cleanFilters);
  };

  const clearAllFilters = () => {
    setBuscar("");
    setEstados([]);
    setFuentes([]);
    setPrioridad("");
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, teléfono..."
            value={buscar}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {/* Estados */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                Estado
                {estados.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5">
                    {estados.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Filtrar por estado</p>
                {ESTADOS.map((estado) => (
                  <label
                    key={estado.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={estados.includes(estado.value)}
                      onChange={() => toggleEstado(estado.value)}
                      className="rounded border-input"
                    />
                    <span className={`w-2 h-2 rounded-full ${estado.color}`} />
                    <span className="text-sm">{estado.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Fuentes */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                Fuente
                {fuentes.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5">
                    {fuentes.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="end">
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Filtrar por fuente</p>
                {FUENTES.map((fuente) => (
                  <label
                    key={fuente.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={fuentes.includes(fuente.value)}
                      onChange={() => toggleFuente(fuente.value)}
                      className="rounded border-input"
                    />
                    <span className="text-sm">{fuente.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Prioridad */}
          <Select value={prioridad || "todas"} onValueChange={handlePrioridadChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {PRIORIDADES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Limpiar filtros */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearAllFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Badges de filtros activos */}
      {(estados.length > 0 || fuentes.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {estados.map((estado) => {
            const e = ESTADOS.find((s) => s.value === estado);
            return (
              <Badge
                key={estado}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => toggleEstado(estado)}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${e?.color}`} />
                {e?.label}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
          {fuentes.map((fuente) => {
            const f = FUENTES.find((s) => s.value === fuente);
            return (
              <Badge
                key={fuente}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => toggleFuente(fuente)}
              >
                {f?.label}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
