import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema para crear lead manual
const createLeadSchema = z.object({
  nombre: z.string().min(2).max(255),
  email: z.string().email().optional().nullable(),
  telefono: z.string().min(9).max(20),
  localidad: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  servicios: z.array(z.string()).default([]),
  fuente: z.enum(["landing", "google_ads", "organico", "referido", "redes_sociales", "directo", "otro"]).default("directo"),
  notas: z.string().optional().nullable(),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]).default("media"),
});

/**
 * GET /api/leads
 * Lista leads con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Paginación
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filtros
    const estado = searchParams.get("estado");
    const fuente = searchParams.get("fuente");
    const landingId = searchParams.get("landing_id");
    const prioridad = searchParams.get("prioridad");
    const buscar = searchParams.get("buscar");
    const fechaDesde = searchParams.get("fecha_desde");
    const fechaHasta = searchParams.get("fecha_hasta");

    // Ordenación
    const orden = searchParams.get("orden") || "createdAt";
    const direccion = searchParams.get("direccion") || "desc";

    // Construir where clause
    const where: Record<string, unknown> = {};

    if (estado) {
      const estados = estado.split(",");
      where.estado = { in: estados };
    }

    if (fuente) {
      const fuentes = fuente.split(",");
      where.fuente = { in: fuentes };
    }

    if (landingId) {
      where.landingId = parseInt(landingId);
    }

    if (prioridad) {
      where.prioridad = prioridad;
    }

    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar, mode: "insensitive" } },
        { email: { contains: buscar, mode: "insensitive" } },
        { telefono: { contains: buscar } },
        { localidad: { contains: buscar, mode: "insensitive" } },
      ];
    }

    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) {
        (where.createdAt as Record<string, Date>).gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        (where.createdAt as Record<string, Date>).lte = new Date(fechaHasta);
      }
    }

    // Ejecutar queries en paralelo
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          landing: {
            select: { id: true, nombre: true, slug: true },
          },
          _count: {
            select: { actividades: true },
          },
        },
        orderBy: { [orden]: direccion },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error al obtener leads" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Crear lead manual
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createLeadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        ...data,
        estado: "nuevo",
      },
    });

    // Crear actividad de creación
    await prisma.actividad.create({
      data: {
        leadId: lead.id,
        tipo: "creacion",
        descripcion: "Lead creado manualmente",
        estadoNuevo: "nuevo",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Error al crear lead" },
      { status: 500 }
    );
  }
}
