import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const COMISION_PORCENTAJE = 10;

const cambioEstadoSchema = z.object({
  estado: z.enum([
    "nuevo",
    "contactado",
    "cualificado",
    "reunion",
    "presupuestado",
    "negociacion",
    "ganado",
    "perdido",
  ]),
  nota: z.string().optional(),
  importeVenta: z.number().optional(), // Requerido si estado es "ganado"
});

/**
 * PUT /api/leads/[id]/estado
 * Cambiar estado del lead en el pipeline
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id);
    const body = await request.json();
    const { estado, nota, importeVenta } = cambioEstadoSchema.parse(body);

    // Obtener lead actual
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead no encontrado" },
        { status: 404 }
      );
    }

    const estadoAnterior = lead.estado;

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = { estado };

    // Si el estado es "ganado", calcular comisión
    if (estado === "ganado") {
      if (!importeVenta && !lead.importeVenta) {
        return NextResponse.json(
          { error: "Se requiere el importe de venta para cerrar como ganado" },
          { status: 400 }
        );
      }

      const venta = importeVenta || Number(lead.importeVenta);
      updateData.importeVenta = venta;
      updateData.fechaVenta = new Date();
      updateData.comisionCalculada = venta * (COMISION_PORCENTAJE / 100);
    }

    // Actualizar lead
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    });

    // Crear actividad de cambio de estado
    await prisma.actividad.create({
      data: {
        leadId,
        tipo: estado === "ganado" ? "venta_cerrada" : estado === "perdido" ? "venta_perdida" : "cambio_estado",
        descripcion: nota || `Estado cambiado de ${estadoAnterior} a ${estado}`,
        estadoAnterior,
        estadoNuevo: estado,
        metadata: importeVenta ? { importeVenta } : undefined,
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating lead status:", error);
    return NextResponse.json(
      { error: "Error al cambiar estado" },
      { status: 500 }
    );
  }
}
