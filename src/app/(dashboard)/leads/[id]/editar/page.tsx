"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  notas: string | null;
}

const ESTADOS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cualificado", label: "Cualificado" },
  { value: "reunion", label: "Reunión" },
  { value: "presupuestado", label: "Presupuestado" },
  { value: "negociacion", label: "Negociación" },
  { value: "ganado", label: "Ganado" },
  { value: "perdido", label: "Perdido" },
];

const PRIORIDADES = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const FUENTES = [
  { value: "landing", label: "Landing Page" },
  { value: "referido", label: "Referido" },
  { value: "web", label: "Web" },
  { value: "redes_sociales", label: "Redes Sociales" },
  { value: "otro", label: "Otro" },
];

export default function EditarLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    localidad: "",
    direccion: "",
    servicios: "",
    estado: "nuevo",
    fuente: "landing",
    prioridad: "media",
    presupuestoEnviado: "",
    notas: "",
  });

  useEffect(() => {
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
        const lead: Lead = await response.json();
        setFormData({
          nombre: lead.nombre,
          email: lead.email || "",
          telefono: lead.telefono,
          localidad: lead.localidad || "",
          direccion: lead.direccion || "",
          servicios: lead.servicios?.join(", ") || "",
          estado: lead.estado,
          fuente: lead.fuente,
          prioridad: lead.prioridad || "media",
          presupuestoEnviado: lead.presupuestoEnviado?.toString() || "",
          notas: lead.notas || "",
        });
      } catch (error) {
        toast.error("Error al cargar el lead");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [id, router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!formData.telefono.trim()) {
      toast.error("El teléfono es obligatorio");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          email: formData.email.trim() || null,
          telefono: formData.telefono.trim(),
          localidad: formData.localidad.trim() || null,
          direccion: formData.direccion.trim() || null,
          servicios: formData.servicios
            .split(",")
            .map(s => s.trim())
            .filter(Boolean),
          estado: formData.estado,
          fuente: formData.fuente,
          prioridad: formData.prioridad,
          presupuestoEnviado: formData.presupuestoEnviado
            ? parseFloat(formData.presupuestoEnviado)
            : null,
          notas: formData.notas.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar");
      }

      toast.success("Lead actualizado correctamente");
      router.push(`/leads/${id}`);
    } catch (error) {
      toast.error("Error al guardar los cambios");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/leads/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Editar Lead</h1>
          <p className="text-muted-foreground">Modifica la información del lead</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  placeholder="+34 600 000 000"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localidad">Localidad</Label>
                <Input
                  id="localidad"
                  value={formData.localidad}
                  onChange={(e) => handleChange("localidad", e.target.value)}
                  placeholder="Ciudad"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                placeholder="Calle, número, piso..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Estado y clasificación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado y clasificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((estado) => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuente">Fuente</Label>
                <Select
                  value={formData.fuente}
                  onValueChange={(value) => handleChange("fuente", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUENTES.map((fuente) => (
                      <SelectItem key={fuente.value} value={fuente.value}>
                        {fuente.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) => handleChange("prioridad", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORIDADES.map((prioridad) => (
                      <SelectItem key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Servicios y presupuesto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Servicios y presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="servicios">Servicios (separados por coma)</Label>
              <Input
                id="servicios"
                value={formData.servicios}
                onChange={(e) => handleChange("servicios", e.target.value)}
                placeholder="Ventanas, Puertas, Persianas..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="presupuestoEnviado">Presupuesto enviado (€)</Label>
              <Input
                id="presupuestoEnviado"
                type="number"
                step="0.01"
                min="0"
                value={formData.presupuestoEnviado}
                onChange={(e) => handleChange("presupuestoEnviado", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notas}
              onChange={(e) => handleChange("notas", e.target.value)}
              placeholder="Notas adicionales sobre el lead..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/leads/${id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
