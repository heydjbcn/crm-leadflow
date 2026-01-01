import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoGasto } from "@prisma/client";
import { z } from "zod";

// Schema para crear gasto
const createGastoSchema = z.object({
  tipo: z.enum(["anuncios", "desplazamiento", "material", "comision_plataforma", "otro"]),
  concepto: z.string().min(2).max(255),
  importe: z.number().positive(),
  fecha: z.string().optional(),
  notas: z.string().optional().nullable(),
  landingId: z.number().optional().nullable(),
});

/**
 * GET /api/gastos
 * Lista gastos con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Paginación
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Filtros
    const tipo = searchParams.get("tipo");
    const landingId = searchParams.get("landing_id");
    const fechaDesde = searchParams.get("fecha_desde");
    const fechaHasta = searchParams.get("fecha_hasta");

    // Construir where clause
    const where: Record<string, unknown> = {};

    if (tipo) {
      where.tipo = tipo as TipoGasto;
    }

    if (landingId) {
      where.landingId = parseInt(landingId);
    }

    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) {
        (where.fecha as Record<string, Date>).gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        (where.fecha as Record<string, Date>).lte = hasta;
      }
    }

    // Ejecutar queries en paralelo
    const [gastos, total, totalesPorTipo] = await Promise.all([
      prisma.gasto.findMany({
        where,
        include: {
          landing: {
            select: { id: true, nombre: true },
          },
        },
        orderBy: { fecha: "desc" },
        skip,
        take: limit,
      }),
      prisma.gasto.count({ where }),
      prisma.gasto.groupBy({
        by: ["tipo"],
        where,
        _sum: {
          importe: true,
        },
      }),
    ]);

    // Calcular total de gastos
    const totalGastos = totalesPorTipo.reduce(
      (acc, item) => acc + (item._sum.importe?.toNumber() || 0),
      0
    );

    return NextResponse.json({
      gastos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      resumen: {
        total: totalGastos,
        porTipo: totalesPorTipo.reduce(
          (acc, item) => ({
            ...acc,
            [item.tipo]: item._sum.importe?.toNumber() || 0,
          }),
          {} as Record<string, number>
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching gastos:", error);
    return NextResponse.json(
      { error: "Error al obtener gastos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gastos
 * Crear nuevo gasto
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createGastoSchema.parse(body);

    const gasto = await prisma.gasto.create({
      data: {
        tipo: data.tipo as TipoGasto,
        concepto: data.concepto,
        importe: data.importe,
        fecha: data.fecha ? new Date(data.fecha) : new Date(),
        notas: data.notas,
        landingId: data.landingId,
      },
      include: {
        landing: {
          select: { id: true, nombre: true },
        },
      },
    });

    return NextResponse.json(gasto, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating gasto:", error);
    return NextResponse.json(
      { error: "Error al crear gasto" },
      { status: 500 }
    );
  }
}
