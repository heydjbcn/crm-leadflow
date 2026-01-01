"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, TrendingDown, Users, Euro, Percent, Target, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";

interface DashboardData {
  periodo: number;
  kpis: {
    totalLeads: number;
    leadsNuevos: number;
    ventasCerradas: number;
    ingresosTotales: number;
    comisionesTotales: number;
    valorPipeline: number;
    tasaConversion: number;
  };
  charts: {
    porEstado: { estado: string; count: number }[];
    porFuente: { fuente: string; count: number }[];
    porLanding: { landingId: number; nombre: string; count: number }[];
    tendencia: { fecha: string; count: number }[];
  };
}

const ESTADO_COLORS: Record<string, string> = {
  nuevo: "#3b82f6",
  contactado: "#06b6d4",
  cualificado: "#8b5cf6",
  reunion: "#f59e0b",
  presupuestado: "#f97316",
  negociacion: "#ec4899",
  ganado: "#10b981",
  perdido: "#ef4444",
};

const FUENTE_COLORS: Record<string, string> = {
  landing: "#3b82f6",
  google_ads: "#22c55e",
  organico: "#8b5cf6",
  referido: "#f59e0b",
  redes_sociales: "#ec4899",
  directo: "#64748b",
  otro: "#94a3b8",
};

const ESTADO_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cualificado: "Cualificado",
  reunion: "Reunión",
  presupuestado: "Presupuestado",
  negociacion: "Negociación",
  ganado: "Ganado",
  perdido: "Perdido",
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

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState("30");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard?periodo=${periodo}`);
      if (!response.ok) throw new Error("Error al cargar datos");
      const result = await response.json();
      setData(result);
    } catch (error) {
      toast.error("Error al cargar los datos de analytics");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periodo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { kpis, charts } = data;

  // Preparar datos para gráficos
  const estadoData = charts.porEstado.map((item) => ({
    name: ESTADO_LABELS[item.estado] || item.estado,
    value: item.count,
    color: ESTADO_COLORS[item.estado] || "#94a3b8",
  }));

  const fuenteData = charts.porFuente.map((item) => ({
    name: FUENTE_LABELS[item.fuente] || item.fuente,
    value: item.count,
    color: FUENTE_COLORS[item.fuente] || "#94a3b8",
  }));

  const tendenciaData = charts.tendencia.map((item) => ({
    fecha: new Date(item.fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    }),
    leads: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas y análisis de rendimiento
          </p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
            <SelectItem value="365">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leads Nuevos</p>
                <p className="text-2xl font-bold">{kpis.leadsNuevos}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              De {kpis.totalLeads} leads totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventas Cerradas</p>
                <p className="text-2xl font-bold">{kpis.ventasCerradas}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tasa: {formatPercent(kpis.tasaConversion)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold">{formatCurrency(kpis.ingresosTotales)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Euro className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pipeline: {formatCurrency(kpis.valorPipeline)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comisiones</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(kpis.comisionesTotales)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Percent className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              10% sobre ventas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tendencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendencia de Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tendenciaData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="fecha"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Leads por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {estadoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Por Fuente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Leads por Fuente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuenteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {fuenteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value) => (
                      <span className="text-sm text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento por Landing */}
      {charts.porLanding.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rendimiento por Landing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts.porLanding.map((landing) => {
                const percentage = (landing.count / kpis.leadsNuevos) * 100;
                return (
                  <div key={landing.landingId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{landing.nombre}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {landing.count} leads
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
