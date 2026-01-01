import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EstadoLead, PrioridadLead, TipoActividad } from "@prisma/client";
import { z } from "zod";

// Schema para acciones masivas
const bulkActionSchema = z.object({
  ids: z.array(z.number()).min(1),
  action: z.enum(["delete", "updateStatus", "updatePriority"]),
  value: z.string().optional(),
});

/**
 * POST /api/leads/bulk
 * Ejecutar acciones masivas sobre leads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action, value } = bulkActionSchema.parse(body);

    switch (action) {
      case "delete": {
        // Eliminar múltiples leads
        const result = await prisma.lead.deleteMany({
          where: { id: { in: ids } },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} leads eliminados`,
          count: result.count,
        });
      }

      case "updateStatus": {
        if (!value) {
          return NextResponse.json(
            { error: "Se requiere un estado" },
            { status: 400 }
          );
        }

        const validStatuses = Object.values(EstadoLead);
        if (!validStatuses.includes(value as EstadoLead)) {
          return NextResponse.json(
            { error: "Estado inválido" },
            { status: 400 }
          );
        }

        const estadoValue = value as EstadoLead;

        const result = await prisma.lead.updateMany({
          where: { id: { in: ids } },
          data: { estado: estadoValue },
        });

        // Crear actividades para cada lead
        await prisma.actividad.createMany({
          data: ids.map((leadId) => ({
            leadId,
            tipo: TipoActividad.cambio_estado,
            descripcion: `Estado cambiado a ${value} (acción masiva)`,
            estadoNuevo: estadoValue,
          })),
        });

        return NextResponse.json({
          success: true,
          message: `${result.count} leads actualizados`,
          count: result.count,
        });
      }

      case "updatePriority": {
        if (!value) {
          return NextResponse.json(
            { error: "Se requiere una prioridad" },
            { status: 400 }
          );
        }

        const validPriorities = Object.values(PrioridadLead);
        if (!validPriorities.includes(value as PrioridadLead)) {
          return NextResponse.json(
            { error: "Prioridad inválida" },
            { status: 400 }
          );
        }

        const result = await prisma.lead.updateMany({
          where: { id: { in: ids } },
          data: { prioridad: value as PrioridadLead },
        });

        return NextResponse.json({
          success: true,
          message: `${result.count} leads actualizados`,
          count: result.count,
        });
      }

      default:
        return NextResponse.json(
          { error: "Acción no válida" },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error en acción masiva:", error);
    return NextResponse.json(
      { error: "Error al ejecutar acción masiva" },
      { status: 500 }
    );
  }
}
