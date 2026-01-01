import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const actividadSchema = z.object({
  tipo: z.enum([
    "nota",
    "llamada",
    "email",
    "reunion",
    "whatsapp",
    "presupuesto_enviado",
    "presupuesto_actualizado",
  ]),
  descripcion: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * POST /api/leads/[id]/actividad
 * Añadir nota o actividad a un lead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);
    const body = await request.json();
    const data = actividadSchema.parse(body);

    // Verificar que el lead existe
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead no encontrado" },
        { status: 404 }
      );
    }

    // Crear actividad
    const actividad = await prisma.actividad.create({
      data: {
        leadId,
        tipo: data.tipo,
        descripcion: data.descripcion,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    // Si es un presupuesto, actualizar el lead
    if (data.tipo === "presupuesto_enviado" && data.metadata?.importe) {
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          presupuestoEnviado: data.metadata.importe as number,
          fechaPresupuesto: new Date(),
        },
      });
    }

    return NextResponse.json(actividad, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Error al crear actividad" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/[id]/actividad
 * Obtener actividades de un lead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const actividades = await prisma.actividad.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(actividades);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Error al obtener actividades" },
      { status: 500 }
    );
  }
}
