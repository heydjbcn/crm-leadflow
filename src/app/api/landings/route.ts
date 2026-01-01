import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const createLandingSchema = z.object({
  nombre: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  url: z.string().url().optional().nullable(),
});

/**
 * GET /api/landings
 * Listar todas las landings con sus API Keys
 */
export async function GET() {
  try {
    const landings = await prisma.landing.findMany({
      include: {
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(landings);
  } catch (error) {
    console.error("Error fetching landings:", error);
    return NextResponse.json(
      { error: "Error al obtener landings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/landings
 * Crear nueva landing con API Key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createLandingSchema.parse(body);

    // Verificar que el slug no exista
    const existing = await prisma.landing.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una landing con ese slug" },
        { status: 400 }
      );
    }

    // Generar API Key única
    const apiKey = `lf_${randomBytes(24).toString("hex")}`;

    const landing = await prisma.landing.create({
      data: {
        ...data,
        apiKey,
      },
    });

    return NextResponse.json(landing, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating landing:", error);
    return NextResponse.json(
      { error: "Error al crear landing" },
      { status: 500 }
    );
  }
}
