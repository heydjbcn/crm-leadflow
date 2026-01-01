import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/dashboard
 * Obtener métricas del dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "30"; // días
    const dias = parseInt(periodo);

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    // Ejecutar queries en paralelo
    const [
      totalLeads,
      leadsNuevos,
      leadsPorEstado,
      leadsPorFuente,
      leadsPorLanding,
      ventasCerradas,
      totalPresupuestado,
      leadsPorDia,
      conversionRate,
    ] = await Promise.all([
      // Total de leads
      prisma.lead.count(),

      // Leads nuevos en el período
      prisma.lead.count({
        where: {
          createdAt: { gte: fechaInicio },
        },
      }),

      // Leads por estado
      prisma.lead.groupBy({
        by: ["estado"],
        _count: { _all: true },
      }),

      // Leads por fuente
      prisma.lead.groupBy({
        by: ["fuente"],
        _count: { _all: true },
        where: {
          createdAt: { gte: fechaInicio },
        },
      }),

      // Leads por landing
      prisma.lead.groupBy({
        by: ["landingId"],
        _count: { _all: true },
        where: {
          landingId: { not: null },
          createdAt: { gte: fechaInicio },
        },
      }),

      // Ventas cerradas (ganados)
      prisma.lead.aggregate({
        where: { estado: "ganado" },
        _count: { _all: true },
        _sum: { importeVenta: true, comisionCalculada: true },
      }),

      // Total presupuestado (en pipeline)
      prisma.lead.aggregate({
        where: {
          estado: { notIn: ["ganado", "perdido"] },
          presupuestoEnviado: { not: null },
        },
        _sum: { presupuestoEnviado: true },
      }),

      // Leads por día (últimos N días)
      prisma.$queryRaw`
        SELECT DATE(created_at) as fecha, COUNT(*) as count
        FROM leads
        WHERE created_at >= ${fechaInicio}
        GROUP BY DATE(created_at)
        ORDER BY fecha ASC
      ` as Promise<{ fecha: Date; count: bigint }[]>,

      // Tasa de conversión
      prisma.lead.count({
        where: {
          estado: "ganado",
          createdAt: { gte: fechaInicio },
        },
      }),
    ]);

    // Obtener nombres de landings
    const landingIds = leadsPorLanding.map((l) => l.landingId).filter(Boolean) as number[];
    const landings = await prisma.landing.findMany({
      where: { id: { in: landingIds } },
      select: { id: true, nombre: true },
    });

    const landingsMap = new Map(landings.map((l) => [l.id, l.nombre]));

    // Calcular métricas
    const tasaConversion = leadsNuevos > 0 ? (conversionRate / leadsNuevos) * 100 : 0;

    // Formatear datos para gráficos
    const estadosData = leadsPorEstado.map((e) => ({
      estado: e.estado,
      count: e._count._all,
    }));

    const fuentesData = leadsPorFuente.map((f) => ({
      fuente: f.fuente,
      count: f._count._all,
    }));

    const landingsData = leadsPorLanding.map((l) => ({
      landingId: l.landingId,
      nombre: landingsMap.get(l.landingId!) || "Desconocido",
      count: l._count._all,
    }));

    // Llenar días faltantes
    const leadsPorDiaMap = new Map(
      (leadsPorDia as { fecha: Date; count: bigint }[]).map((d) => [
        new Date(d.fecha).toISOString().split("T")[0],
        Number(d.count),
      ])
    );

    const tendencia = [];
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split("T")[0];
      tendencia.push({
        fecha: fechaStr,
        count: leadsPorDiaMap.get(fechaStr) || 0,
      });
    }

    return NextResponse.json({
      periodo: dias,
      kpis: {
        totalLeads,
        leadsNuevos,
        ventasCerradas: ventasCerradas._count._all,
        ingresosTotales: Number(ventasCerradas._sum.importeVenta) || 0,
        comisionesTotales: Number(ventasCerradas._sum.comisionCalculada) || 0,
        valorPipeline: Number(totalPresupuestado._sum.presupuestoEnviado) || 0,
        tasaConversion,
      },
      charts: {
        porEstado: estadosData,
        porFuente: fuentesData,
        porLanding: landingsData,
        tendencia,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del dashboard" },
      { status: 500 }
    );
  }
}
