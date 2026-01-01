import { Suspense } from "react";
import {
  Users,
  TrendingUp,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Datos de ejemplo para el dashboard
const kpis = [
  {
    title: "Leads Totales",
    value: "247",
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "vs. mes anterior",
  },
  {
    title: "Este Mes",
    value: "34",
    change: "+8",
    trend: "up",
    icon: TrendingUp,
    description: "nuevos leads",
  },
  {
    title: "Tasa Conversión",
    value: "23.5%",
    change: "+2.1%",
    trend: "up",
    icon: Percent,
    description: "vs. mes anterior",
  },
  {
    title: "Ingresos",
    value: "45.2k€",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    description: "ventas cerradas",
  },
];

const recentLeads = [
  {
    id: 1,
    nombre: "María García",
    email: "maria@email.com",
    fuente: "Google Ads",
    estado: "nuevo",
    fecha: "Hace 2h",
  },
  {
    id: 2,
    nombre: "Juan López",
    email: "juan@email.com",
    fuente: "SEO",
    estado: "contactado",
    fecha: "Hace 4h",
  },
  {
    id: 3,
    nombre: "Ana Martínez",
    email: "ana@email.com",
    fuente: "Facebook",
    estado: "cualificado",
    fecha: "Ayer",
  },
  {
    id: 4,
    nombre: "Carlos Ruiz",
    email: "carlos@email.com",
    fuente: "Directo",
    estado: "reunion",
    fecha: "Ayer",
  },
  {
    id: 5,
    nombre: "Pedro Sánchez",
    email: "pedro@email.com",
    fuente: "Google Ads",
    estado: "presupuestado",
    fecha: "Hace 2 días",
  },
];

const pipelineStats = [
  { estado: "Nuevo", count: 45, color: "nuevo" },
  { estado: "Contactado", count: 28, color: "contactado" },
  { estado: "Cualificado", count: 21, color: "cualificado" },
  { estado: "Reunión", count: 15, color: "reunion" },
  { estado: "Presupuestado", count: 12, color: "presupuestado" },
  { estado: "Negociación", count: 8, color: "negociacion" },
  { estado: "Ganado", count: 6, color: "ganado" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu actividad de leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Exportar</Button>
          <Button>+ Nuevo Lead</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      kpi.trend === "up" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {kpi.change}
                  </span>
                  <span className="text-muted-foreground">
                    {kpi.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Pipeline funnel */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineStats.map((stat) => (
              <div key={stat.estado} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">{stat.estado}</div>
                <div className="flex-1">
                  <div className="h-6 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-[var(--status-${stat.color})]`}
                      style={{
                        width: `${(stat.count / 45) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-8 text-right text-sm font-medium">
                  {stat.count}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent leads */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Leads Recientes</CardTitle>
            <Button variant="ghost" size="sm">
              Ver todos →
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {lead.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium">{lead.nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.fuente}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={lead.estado as "nuevo" | "contactado" | "cualificado" | "reunion" | "presupuestado"}
                    >
                      {lead.estado.charAt(0).toUpperCase() + lead.estado.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {lead.fecha}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comisiones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,520€</div>
            <p className="text-xs text-muted-foreground">
              De 6 ventas cerradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor en Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87,500€</div>
            <p className="text-xs text-muted-foreground">
              35 leads en proceso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiempo Medio de Cierre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 días</div>
            <p className="text-xs text-muted-foreground">
              -2 días vs. mes anterior
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
