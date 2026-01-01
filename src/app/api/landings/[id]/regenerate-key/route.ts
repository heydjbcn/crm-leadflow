import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * POST /api/landings/[id]/regenerate-key
 * Regenerar API Key de una landing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landingId = parseInt(id);

    // Generar nueva API Key
    const apiKey = `lf_${randomBytes(24).toString("hex")}`;

    const landing = await prisma.landing.update({
      where: { id: landingId },
      data: { apiKey },
    });

    return NextResponse.json({ apiKey: landing.apiKey });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return NextResponse.json(
      { error: "Error al regenerar API Key" },
      { status: 500 }
    );
  }
}
