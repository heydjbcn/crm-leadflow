import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/balance
 * Obtener resumen de balance: ingresos (comisiones) vs gastos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros de fecha
    const fechaDesde = searchParams.get("fecha_desde");
    const fechaHasta = searchParams.get("fecha_hasta");

    // Construir where clauses
    const whereLeads: Record<string, unknown> = {
      estado: "ganado",
      importeVenta: { not: null },
    };

    const whereGastos: Record<string, unknown> = {};

    if (fechaDesde || fechaHasta) {
      if (fechaDesde) {
        whereLeads.fechaVenta = { gte: new Date(fechaDesde) };
        whereGastos.fecha = { gte: new Date(fechaDesde) };
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        whereLeads.fechaVenta = {
          ...(whereLeads.fechaVenta as Record<string, unknown> || {}),
          lte: hasta
        };
        whereGastos.fecha = {
          ...(whereGastos.fecha as Record<string, unknown> || {}),
          lte: hasta
        };
      }
    }

    // Obtener datos en paralelo
    const [
      leadsGanados,
      gastosPorTipo,
      ventasPorMes,
      gastosPorMes,
    ] = await Promise.all([
      // Leads ganados con ventas
      prisma.lead.findMany({
        where: whereLeads,
        select: {
          id: true,
          nombre: true,
          importeVenta: true,
          fechaVenta: true,
          comisionCalculada: true,
          comisionPagada: true,
          landing: {
            select: { id: true, nombre: true },
          },
        },
        orderBy: { fechaVenta: "desc" },
      }),

      // Totales de gastos por tipo
      prisma.gasto.groupBy({
        by: ["tipo"],
        where: whereGastos,
        _sum: { importe: true },
      }),

      // Ventas agrupadas por mes (últimos 12 meses)
      prisma.$queryRaw`
        SELECT
          TO_CHAR(fecha_venta, 'YYYY-MM') as mes,
          SUM(importe_venta) as total_ventas,
          SUM(importe_venta * 0.10) as total_comision,
          COUNT(*) as num_ventas
        FROM leads
        WHERE estado = 'ganado'
          AND importe_venta IS NOT NULL
          AND fecha_venta >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(fecha_venta, 'YYYY-MM')
        ORDER BY mes DESC
      ` as Promise<Array<{ mes: string; total_ventas: number; total_comision: number; num_ventas: number }>>,

      // Gastos agrupados por mes (últimos 12 meses)
      prisma.$queryRaw`
        SELECT
          TO_CHAR(fecha, 'YYYY-MM') as mes,
          tipo,
          SUM(importe) as total
        FROM gastos
        WHERE fecha >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(fecha, 'YYYY-MM'), tipo
        ORDER BY mes DESC
      ` as Promise<Array<{ mes: string; tipo: string; total: number }>>,
    ]);

    // Calcular totales
    const totalVentas = leadsGanados.reduce(
      (sum, lead) => sum + (lead.importeVenta?.toNumber() || 0),
      0
    );

    const totalComisiones = totalVentas * 0.10;

    const comisionesPagadas = leadsGanados
      .filter((l) => l.comisionPagada)
      .reduce((sum, lead) => sum + (lead.importeVenta?.toNumber() || 0) * 0.10, 0);

    const comisionesPendientes = totalComisiones - comisionesPagadas;

    const totalGastos = gastosPorTipo.reduce(
      (sum, item) => sum + (item._sum.importe?.toNumber() || 0),
      0
    );

    const balance = totalComisiones - totalGastos;

    // Formatear gastos por tipo
    const gastosPorTipoFormateado = gastosPorTipo.reduce(
      (acc, item) => ({
        ...acc,
        [item.tipo]: item._sum.importe?.toNumber() || 0,
      }),
      {} as Record<string, number>
    );

    // Agrupar gastos por mes
    const gastosPorMesAgrupados = gastosPorMes.reduce(
      (acc, item) => {
        if (!acc[item.mes]) {
          acc[item.mes] = { total: 0, porTipo: {} };
        }
        acc[item.mes].total += Number(item.total);
        acc[item.mes].porTipo[item.tipo] = Number(item.total);
        return acc;
      },
      {} as Record<string, { total: number; porTipo: Record<string, number> }>
    );

    return NextResponse.json({
      resumen: {
        totalVentas,
        totalComisiones,
        comisionesPagadas,
        comisionesPendientes,
        totalGastos,
        balance,
        balanceNeto: comisionesPendientes - totalGastos,
      },
      gastosPorTipo: gastosPorTipoFormateado,
      ventasPorMes: ventasPorMes.map((v) => ({
        mes: v.mes,
        ventas: Number(v.total_ventas),
        comision: Number(v.total_comision),
        numVentas: Number(v.num_ventas),
      })),
      gastosPorMes: gastosPorMesAgrupados,
      leadsGanados: leadsGanados.map((lead) => ({
        id: lead.id,
        nombre: lead.nombre,
        venta: lead.importeVenta?.toNumber() || 0,
        comision: (lead.importeVenta?.toNumber() || 0) * 0.10,
        fechaVenta: lead.fechaVenta,
        pagada: lead.comisionPagada,
        landing: lead.landing,
      })),
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "Error al obtener balance" },
      { status: 500 }
    );
  }
}
