import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoGasto } from "@prisma/client";
import { z } from "zod";

// Schema para actualizar gasto
const updateGastoSchema = z.object({
  tipo: z.enum(["anuncios", "desplazamiento", "material", "comision_plataforma", "otro"]).optional(),
  concepto: z.string().min(2).max(255).optional(),
  importe: z.number().positive().optional(),
  fecha: z.string().optional(),
  notas: z.string().optional().nullable(),
  landingId: z.number().optional().nullable(),
});

/**
 * GET /api/gastos/[id]
 * Obtener detalle de un gasto
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gastoId = parseInt(id);

    const gasto = await prisma.gasto.findUnique({
      where: { id: gastoId },
      include: {
        landing: {
          select: { id: true, nombre: true },
        },
      },
    });

    if (!gasto) {
      return NextResponse.json(
        { error: "Gasto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(gasto);
  } catch (error) {
    console.error("Error fetching gasto:", error);
    return NextResponse.json(
      { error: "Error al obtener gasto" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gastos/[id]
 * Actualizar gasto
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gastoId = parseInt(id);
    const body = await request.json();
    const data = updateGastoSchema.parse(body);

    // Verificar que existe
    const existing = await prisma.gasto.findUnique({
      where: { id: gastoId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Gasto no encontrado" },
        { status: 404 }
      );
    }

    const gasto = await prisma.gasto.update({
      where: { id: gastoId },
      data: {
        ...(data.tipo && { tipo: data.tipo as TipoGasto }),
        ...(data.concepto && { concepto: data.concepto }),
        ...(data.importe && { importe: data.importe }),
        ...(data.fecha && { fecha: new Date(data.fecha) }),
        ...(data.notas !== undefined && { notas: data.notas }),
        ...(data.landingId !== undefined && { landingId: data.landingId }),
      },
      include: {
        landing: {
          select: { id: true, nombre: true },
        },
      },
    });

    return NextResponse.json(gasto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating gasto:", error);
    return NextResponse.json(
      { error: "Error al actualizar gasto" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gastos/[id]
 * Eliminar gasto
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gastoId = parseInt(id);

    await prisma.gasto.delete({
      where: { id: gastoId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gasto:", error);
    return NextResponse.json(
      { error: "Error al eliminar gasto" },
      { status: 500 }
    );
  }
}
