import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const updateLandingSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  url: z.string().url().optional().nullable(),
  activa: z.boolean().optional(),
});

/**
 * GET /api/landings/[id]
 * Obtener detalle de una landing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landingId = parseInt(id);

    const landing = await prisma.landing.findUnique({
      where: { id: landingId },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!landing) {
      return NextResponse.json(
        { error: "Landing no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(landing);
  } catch (error) {
    console.error("Error fetching landing:", error);
    return NextResponse.json(
      { error: "Error al obtener landing" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/landings/[id]
 * Actualizar landing
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landingId = parseInt(id);
    const body = await request.json();
    const data = updateLandingSchema.parse(body);

    const landing = await prisma.landing.update({
      where: { id: landingId },
      data,
    });

    return NextResponse.json(landing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating landing:", error);
    return NextResponse.json(
      { error: "Error al actualizar landing" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/landings/[id]
 * Eliminar landing
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landingId = parseInt(id);

    await prisma.landing.delete({
      where: { id: landingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing:", error);
    return NextResponse.json(
      { error: "Error al eliminar landing" },
      { status: 500 }
    );
  }
}
