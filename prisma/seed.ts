import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear usuario admin
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@leadflow.com" },
    update: {},
    create: {
      email: "admin@leadflow.com",
      passwordHash,
      nombre: "Administrador",
      tema: "system",
      comisionPorDefecto: 10,
    },
  });
  console.log("✅ Usuario admin creado:", admin.email);

  // Crear landing de ejemplo
  const landing = await prisma.landing.upsert({
    where: { slug: "solutec-ventanas" },
    update: {},
    create: {
      nombre: "Solutec - Ventanas",
      slug: "solutec-ventanas",
      url: "https://solutecalumini.com/ventanas",
      descripcion: "Landing page de ventanas de aluminio",
      apiKey: "sk_live_solutec_ventanas_" + Math.random().toString(36).substring(2, 15),
      activa: true,
      notificarEmail: true,
      notificarPush: true,
    },
  });
  console.log("✅ Landing creada:", landing.nombre);

  const landing2 = await prisma.landing.upsert({
    where: { slug: "solutec-cerramientos" },
    update: {},
    create: {
      nombre: "Solutec - Cerramientos",
      slug: "solutec-cerramientos",
      url: "https://solutecalumini.com/cerramientos",
      descripcion: "Landing page de cerramientos de aluminio",
      apiKey: "sk_live_solutec_cerram_" + Math.random().toString(36).substring(2, 15),
      activa: true,
      notificarEmail: true,
      notificarPush: true,
    },
  });
  console.log("✅ Landing creada:", landing2.nombre);

  // Crear leads de ejemplo
  const leadsData = [
    {
      nombre: "María García López",
      email: "maria.garcia@email.com",
      telefono: "+34612345678",
      localidad: "Barcelona",
      servicios: ["ventanas", "persianas"],
      estado: "nuevo" as const,
      fuente: "google_ads" as const,
      landingId: landing.id,
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "ventanas-barcelona",
    },
    {
      nombre: "Juan López Martínez",
      email: "juan.lopez@email.com",
      telefono: "+34623456789",
      localidad: "Hospitalet",
      servicios: ["cerramientos", "puertas_correderas"],
      estado: "contactado" as const,
      fuente: "organico" as const,
      landingId: landing2.id,
    },
    {
      nombre: "Ana Martínez Ruiz",
      email: "ana.martinez@email.com",
      telefono: "+34634567890",
      localidad: "Badalona",
      servicios: ["ventanas"],
      estado: "cualificado" as const,
      fuente: "landing" as const,
      landingId: landing.id,
      presupuestoEnviado: 8500,
      fechaPresupuesto: new Date("2024-12-15"),
    },
    {
      nombre: "Carlos Ruiz Sánchez",
      email: "carlos.ruiz@email.com",
      telefono: "+34645678901",
      localidad: "Sant Cugat",
      servicios: ["cerramientos", "ventanas", "mosquiteras"],
      estado: "reunion" as const,
      fuente: "referido" as const,
      landingId: landing2.id,
    },
    {
      nombre: "Pedro Sánchez Gómez",
      email: "pedro.sanchez@email.com",
      telefono: "+34656789012",
      localidad: "Terrassa",
      servicios: ["puertas_correderas"],
      estado: "presupuestado" as const,
      fuente: "google_ads" as const,
      landingId: landing.id,
      presupuestoEnviado: 12500,
      fechaPresupuesto: new Date("2024-12-10"),
    },
    {
      nombre: "Laura Gómez Fernández",
      email: "laura.gomez@email.com",
      telefono: "+34667890123",
      localidad: "Sabadell",
      servicios: ["ventanas", "persianas"],
      estado: "negociacion" as const,
      fuente: "redes_sociales" as const,
      landingId: landing.id,
      presupuestoEnviado: 15000,
      fechaPresupuesto: new Date("2024-12-05"),
    },
    {
      nombre: "Miguel Fernández Torres",
      email: "miguel.fernandez@email.com",
      telefono: "+34678901234",
      localidad: "Barcelona",
      servicios: ["cerramientos"],
      estado: "ganado" as const,
      fuente: "google_ads" as const,
      landingId: landing2.id,
      presupuestoEnviado: 18000,
      fechaPresupuesto: new Date("2024-11-20"),
      importeVenta: 17500,
      fechaVenta: new Date("2024-12-01"),
      comisionCalculada: 1750, // 10%
    },
    {
      nombre: "Isabel Torres Navarro",
      email: "isabel.torres@email.com",
      telefono: "+34689012345",
      localidad: "L'Hospitalet",
      servicios: ["ventanas"],
      estado: "ganado" as const,
      fuente: "organico" as const,
      landingId: landing.id,
      presupuestoEnviado: 9500,
      fechaPresupuesto: new Date("2024-11-15"),
      importeVenta: 9200,
      fechaVenta: new Date("2024-11-28"),
      comisionCalculada: 920, // 10%
    },
    {
      nombre: "Roberto Navarro Díaz",
      email: "roberto.navarro@email.com",
      telefono: "+34690123456",
      localidad: "Girona",
      servicios: ["cerramientos", "puertas_correderas"],
      estado: "perdido" as const,
      fuente: "landing" as const,
      landingId: landing2.id,
      presupuestoEnviado: 22000,
      fechaPresupuesto: new Date("2024-11-10"),
      notas: "Cliente decidió ir con la competencia por precio",
    },
    {
      nombre: "Elena Díaz Moreno",
      email: "elena.diaz@email.com",
      telefono: "+34601234567",
      localidad: "Tarragona",
      servicios: ["ventanas", "mosquiteras"],
      estado: "nuevo" as const,
      fuente: "directo" as const,
      landingId: landing.id,
    },
  ];

  for (const leadData of leadsData) {
    const lead = await prisma.lead.create({
      data: leadData,
    });

    // Crear actividad de creación
    await prisma.actividad.create({
      data: {
        leadId: lead.id,
        tipo: "creacion",
        descripcion: `Lead creado desde ${leadData.fuente}`,
        estadoNuevo: leadData.estado,
        metadata: { source: "seed" },
      },
    });

    console.log("✅ Lead creado:", lead.nombre);
  }

  // Crear configuraciones por defecto
  await prisma.configuracion.upsert({
    where: { clave: "comision_porcentaje" },
    update: {},
    create: {
      clave: "comision_porcentaje",
      valor: "10",
      descripcion: "Porcentaje de comisión por defecto",
    },
  });

  await prisma.configuracion.upsert({
    where: { clave: "moneda" },
    update: {},
    create: {
      clave: "moneda",
      valor: "EUR",
      descripcion: "Moneda por defecto del sistema",
    },
  });

  console.log("✅ Configuraciones creadas");

  console.log("\n🎉 Seed completado con éxito!");
  console.log("\n📋 Resumen:");
  console.log("   - 1 usuario admin (admin@leadflow.com / admin123)");
  console.log("   - 2 landings de ejemplo");
  console.log("   - 10 leads de ejemplo en diferentes estados");
  console.log("   - Configuraciones por defecto");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
