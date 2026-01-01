import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación para el lead
const leadSchema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(255),
  email: z.string().email().optional().nullable(),
  telefono: z.string().min(9, "Teléfono inválido").max(20),
  localidad: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  servicios: z.array(z.string()).default([]),
  notas: z.string().optional().nullable(),
  // UTM params
  utm_source: z.string().optional().nullable(),
  utm_medium: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
  utm_term: z.string().optional().nullable(),
  utm_content: z.string().optional().nullable(),
});

/**
 * Valida la API Key y retorna la landing asociada
 */
async function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("X-API-Key");

  if (!apiKey) {
    return { valid: false, landing: null, error: "API Key requerida" };
  }

  const landing = await prisma.landing.findUnique({
    where: { apiKey, activa: true },
  });

  if (!landing) {
    return { valid: false, landing: null, error: "API Key inválida o landing inactiva" };
  }

  return { valid: true, landing, error: null };
}

/**
 * POST /api/public/leads
 * Endpoint público para recibir leads desde landing pages
 */
export async function POST(request: NextRequest) {
  try {
    // Validar API Key
    const { valid, landing, error } = await validateApiKey(request);
    if (!valid || !landing) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Parsear y validar body
    const body = await request.json();
    const validatedData = leadSchema.parse(body);

    // Obtener IP y User Agent
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    // Crear lead
    const lead = await prisma.lead.create({
      data: {
        nombre: validatedData.nombre,
        email: validatedData.email || null,
        telefono: validatedData.telefono.replace(/\s/g, ""),
        localidad: validatedData.localidad || null,
        direccion: validatedData.direccion || null,
        servicios: validatedData.servicios,
        notas: validatedData.notas || null,
        fuente: "landing",
        landingId: landing.id,
        estado: "nuevo",
        utmSource: validatedData.utm_source || null,
        utmMedium: validatedData.utm_medium || null,
        utmCampaign: validatedData.utm_campaign || null,
        utmTerm: validatedData.utm_term || null,
        utmContent: validatedData.utm_content || null,
        ipOrigen: ip,
        userAgent: userAgent,
      },
    });

    // Crear actividad de creación
    await prisma.actividad.create({
      data: {
        leadId: lead.id,
        tipo: "creacion",
        descripcion: `Lead recibido desde landing: ${landing.nombre}`,
        estadoNuevo: "nuevo",
        metadata: {
          landing: landing.slug,
          utm: {
            source: validatedData.utm_source,
            medium: validatedData.utm_medium,
            campaign: validatedData.utm_campaign,
          },
        },
      },
    });

    // TODO: Enviar notificaciones (email y push) si están habilitadas
    // if (landing.notificarEmail) { await sendNewLeadEmail(lead); }
    // if (landing.notificarPush) { await sendPushNotification(lead); }

    return NextResponse.json(
      {
        success: true,
        leadId: lead.id,
        message: "Lead recibido correctamente",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
