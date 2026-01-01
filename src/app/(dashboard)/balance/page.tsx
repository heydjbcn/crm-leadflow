"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Car,
  Megaphone,
  Package,
  MoreHorizontal,
  Receipt,
  DollarSign,
  Loader2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Gasto {
  id: number;
  tipo: string;
  concepto: string;
  importe: number;
  fecha: string;
  notas: string | null;
  landing?: { id: number; nombre: string } | null;
}

interface LeadGanado {
  id: number;
  nombre: string;
  venta: number;
  comision: number;
  fechaVenta: string | null;
  pagada: boolean;
  landing?: { id: number; nombre: string } | null;
}

interface BalanceData {
  resumen: {
    totalVentas: number;
    totalComisiones: number;
    comisionesPagadas: number;
    comisionesPendientes: number;
    totalGastos: number;
    balance: number;
    balanceNeto: number;
  };
  gastosPorTipo: Record<string, number>;
  leadsGanados: LeadGanado[];
}

interface Landing {
  id: number;
  nombre: string;
}

const TIPO_GASTO_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  anuncios: { label: "Anuncios", icon: Megaphone, color: "text-blue-500" },
  desplazamiento: { label: "Desplazamiento", icon: Car, color: "text-orange-500" },
  material: { label: "Material", icon: Package, color: "text-purple-500" },
  otro: { label: "Otro", icon: MoreHorizontal, color: "text-gray-500" },
};

export default function BalancePage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [landings, setLandings] = useState<Landing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<number | null>(null);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tipo: "anuncios",
    concepto: "",
    importe: "",
    fecha: format(new Date(), "yyyy-MM-dd"),
    notas: "",
    landingId: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [balanceRes, gastosRes, landingsRes] = await Promise.all([
        fetch("/api/balance"),
        fetch("/api/gastos?limit=100"),
        fetch("/api/landings"),
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      if (gastosRes.ok) {
        const gastosData = await gastosRes.json();
        setGastos(gastosData.gastos);
      }

      if (landingsRes.ok) {
        const landingsData = await landingsRes.json();
        setLandings(landingsData.landings || landingsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({
      tipo: "anuncios",
      concepto: "",
      importe: "",
      fecha: format(new Date(), "yyyy-MM-dd"),
      notas: "",
      landingId: "",
    });
    setEditingGasto(null);
  };

  const handleOpenDialog = (gasto?: Gasto) => {
    if (gasto) {
      setEditingGasto(gasto);
      setFormData({
        tipo: gasto.tipo,
        concepto: gasto.concepto,
        importe: gasto.importe.toString(),
        fecha: format(new Date(gasto.fecha), "yyyy-MM-dd"),
        notas: gasto.notas || "",
        landingId: gasto.landing?.id.toString() || "",
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.concepto || !formData.importe) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingGasto
        ? `/api/gastos/${editingGasto.id}`
        : "/api/gastos";
      const method = editingGasto ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: formData.tipo,
          concepto: formData.concepto,
          importe: parseFloat(formData.importe),
          fecha: formData.fecha,
          notas: formData.notas || null,
          landingId: formData.landingId ? parseInt(formData.landingId) : null,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar");

      toast.success(editingGasto ? "Gasto actualizado" : "Gasto creado");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Error al guardar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!gastoToDelete) return;

    try {
      const response = await fetch(`/api/gastos/${gastoToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      toast.success("Gasto eliminado");
      setDeleteDialogOpen(false);
      setGastoToDelete(null);
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar el gasto");
    }
  };

  const formatCurrency = (value: number) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Balance</h1>
          <p className="text-muted-foreground">
            Gestiona tus gastos y visualiza tu balance de comisiones
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo gasto
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones (10%)</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(balance?.resumen.totalComisiones || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              De {formatCurrency(balance?.resumen.totalVentas || 0)} en ventas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(balance?.resumen.totalGastos || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {gastos.length} gastos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(balance?.resumen.balance || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(balance?.resumen.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Comisiones - Gastos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente Cobrar</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(balance?.resumen.comisionesPendientes || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Comisiones por cobrar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gastos por tipo */}
      {balance?.gastosPorTipo && Object.keys(balance.gastosPorTipo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {Object.entries(TIPO_GASTO_CONFIG).map(([tipo, config]) => {
                const amount = balance.gastosPorTipo[tipo] || 0;
                const Icon = config.icon;
                return (
                  <div
                    key={tipo}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                      <p className="font-semibold">{formatCurrency(amount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="gastos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gastos">Gastos</TabsTrigger>
          <TabsTrigger value="comisiones">Comisiones</TabsTrigger>
        </TabsList>

        <TabsContent value="gastos">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historial de gastos</CardTitle>
            </CardHeader>
            <CardContent>
              {gastos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay gastos registrados</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleOpenDialog()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir primer gasto
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Landing</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gastos.map((gasto) => {
                      const tipoConfig = TIPO_GASTO_CONFIG[gasto.tipo];
                      const Icon = tipoConfig?.icon || MoreHorizontal;
                      return (
                        <TableRow key={gasto.id}>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(gasto.fecha), "dd MMM yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${tipoConfig?.color || ""}`} />
                              <span>{tipoConfig?.label || gasto.tipo}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">{gasto.concepto}</span>
                              {gasto.notas && (
                                <span className="block text-xs text-muted-foreground">
                                  {gasto.notas}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {gasto.landing ? (
                              <Badge variant="outline">{gasto.landing.nombre}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            -{formatCurrency(gasto.importe)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(gasto)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setGastoToDelete(gasto.id);
                                    setDeleteDialogOpen(true);
                                  }}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comisiones">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ventas ganadas y comisiones</CardTitle>
            </CardHeader>
            <CardContent>
              {!balance?.leadsGanados || balance.leadsGanados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay ventas cerradas todavía</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Landing</TableHead>
                      <TableHead className="text-right">Venta</TableHead>
                      <TableHead className="text-right">Comisión (10%)</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balance.leadsGanados.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="text-muted-foreground">
                          {lead.fechaVenta
                            ? format(new Date(lead.fechaVenta), "dd MMM yyyy", { locale: es })
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium">{lead.nombre}</TableCell>
                        <TableCell>
                          {lead.landing ? (
                            <Badge variant="outline">{lead.landing.nombre}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(lead.venta)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          +{formatCurrency(lead.comision)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lead.pagada ? "default" : "secondary"}>
                            {lead.pagada ? "Pagada" : "Pendiente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para crear/editar gasto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGasto ? "Editar gasto" : "Nuevo gasto"}
            </DialogTitle>
            <DialogDescription>
              {editingGasto
                ? "Modifica los datos del gasto"
                : "Añade un nuevo gasto para el balance"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_GASTO_CONFIG).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  className="w-full"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto *</Label>
              <Input
                id="concepto"
                placeholder="Ej: Campaña Google Ads Septiembre"
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="importe">Importe (€) *</Label>
                <Input
                  id="importe"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full"
                  value={formData.importe}
                  onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landing">Landing (opcional)</Label>
                <Select
                  value={formData.landingId || "_none"}
                  onValueChange={(value) => setFormData({ ...formData, landingId: value === "_none" ? "" : value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sin asignar</SelectItem>
                    {landings.map((landing) => (
                      <SelectItem key={landing.id} value={landing.id.toString()}>
                        {landing.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                placeholder="Notas adicionales..."
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : editingGasto ? (
                "Guardar cambios"
              ) : (
                "Crear gasto"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este gasto? Esta acción no se
              puede deshacer.
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
    </div>
  );
}
