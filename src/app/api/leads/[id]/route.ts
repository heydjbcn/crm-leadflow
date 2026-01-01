import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema para actualizar lead
const updateLeadSchema = z.object({
  nombre: z.string().min(2).max(255).optional(),
  email: z.string().email().optional().nullable(),
  telefono: z.string().min(9).max(20).optional(),
  localidad: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  servicios: z.array(z.string()).optional(),
  notas: z.string().optional().nullable(),
  estado: z.enum(["nuevo", "contactado", "cualificado", "reunion", "presupuestado", "negociacion", "ganado", "perdido"]).optional(),
  fuente: z.enum(["landing", "google_ads", "organico", "referido", "redes_sociales", "directo", "otro"]).optional(),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]).optional(),
  presupuestoEnviado: z.number().optional().nullable(),
  importeVenta: z.number().optional().nullable(),
});

/**
 * GET /api/leads/[id]
 * Obtener detalle de un lead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        landing: true,
        actividades: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Error al obtener lead" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leads/[id]
 * Actualizar lead
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);
    const body = await request.json();
    const data = updateLeadSchema.parse(body);

    // Verificar que existe
    const existing = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Lead no encontrado" },
        { status: 404 }
      );
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data,
    });

    return NextResponse.json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Error al actualizar lead" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 * Eliminar lead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Error al eliminar lead" },
      { status: 500 }
    );
  }
}
