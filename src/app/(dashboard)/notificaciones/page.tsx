"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bell,
  UserPlus,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Check,
  MailOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  tipo: "nuevo_lead" | "lead_cualificado" | "venta_cerrada" | "recordatorio";
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  leadId?: number;
}

// Datos de ejemplo - en producción vendrían de la API
const notificacionesEjemplo: Notification[] = [
  {
    id: 1,
    tipo: "nuevo_lead",
    titulo: "Nuevo lead recibido",
    mensaje: "María García - Landing Ventanas",
    leida: false,
    fecha: new Date(Date.now() - 5 * 60 * 1000), // Hace 5 min
    leadId: 1,
  },
  {
    id: 2,
    tipo: "lead_cualificado",
    titulo: "Lead cualificado",
    mensaje: "Juan López pasó a Cualificado",
    leida: false,
    fecha: new Date(Date.now() - 60 * 60 * 1000), // Hace 1h
    leadId: 2,
  },
  {
    id: 3,
    tipo: "venta_cerrada",
    titulo: "Venta cerrada",
    mensaje: "Pedro Martínez - 12,500€",
    leida: false,
    fecha: new Date(Date.now() - 3 * 60 * 60 * 1000), // Hace 3h
    leadId: 3,
  },
  {
    id: 4,
    tipo: "nuevo_lead",
    titulo: "Nuevo lead recibido",
    mensaje: "Ana Ruiz - Landing Puertas",
    leida: true,
    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
    leadId: 4,
  },
  {
    id: 5,
    tipo: "recordatorio",
    titulo: "Recordatorio de seguimiento",
    mensaje: "Llamar a Carlos Fernández para seguimiento",
    leida: true,
    fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
    leadId: 5,
  },
];

const TIPO_CONFIG = {
  nuevo_lead: {
    icon: UserPlus,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  lead_cualificado: {
    icon: TrendingUp,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  venta_cerrada: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  recordatorio: {
    icon: AlertCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
};

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState(notificacionesEjemplo);
  const [filtro, setFiltro] = useState<"todas" | "no_leidas">("todas");

  const notificacionesFiltradas =
    filtro === "todas"
      ? notificaciones
      : notificaciones.filter((n) => !n.leida);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const marcarComoLeida = (id: number) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const marcarTodasComoLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const eliminarNotificacion = (id: number) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            {noLeidas > 0
              ? `Tienes ${noLeidas} notificación${noLeidas > 1 ? "es" : ""} sin leer`
              : "No tienes notificaciones pendientes"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filtro === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro("todas")}
          >
            Todas
          </Button>
          <Button
            variant={filtro === "no_leidas" ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro("no_leidas")}
          >
            No leídas
            {noLeidas > 0 && (
              <Badge variant="secondary" className="ml-2">
                {noLeidas}
              </Badge>
            )}
          </Button>
          {noLeidas > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarTodasComoLeidas}>
              <MailOpen className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      {/* Lista de notificaciones */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {filtro === "todas" ? "Todas las notificaciones" : "Sin leer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notificacionesFiltradas.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacionesFiltradas.map((notif) => {
                const config = TIPO_CONFIG[notif.tipo];
                const Icon = config.icon;

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
                      !notif.leida && "bg-primary/5"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        config.bgColor
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={cn(
                              "font-medium",
                              !notif.leida && "font-semibold"
                            )}
                          >
                            {notif.titulo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notif.mensaje}
                          </p>
                        </div>
                        {!notif.leida && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(notif.fecha, {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notif.leida && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => marcarComoLeida(notif.id)}
                          title="Marcar como leída"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => eliminarNotificacion(notif.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
