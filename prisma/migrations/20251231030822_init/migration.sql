-- CreateEnum
CREATE TYPE "estado_lead" AS ENUM ('nuevo', 'contactado', 'cualificado', 'reunion', 'presupuestado', 'negociacion', 'ganado', 'perdido');

-- CreateEnum
CREATE TYPE "fuente_lead" AS ENUM ('landing', 'google_ads', 'organico', 'referido', 'redes_sociales', 'directo', 'otro');

-- CreateEnum
CREATE TYPE "tipo_actividad" AS ENUM ('nota', 'llamada', 'email', 'reunion', 'whatsapp', 'cambio_estado', 'presupuesto_enviado', 'presupuesto_actualizado', 'venta_cerrada', 'venta_perdida', 'creacion');

-- CreateEnum
CREATE TYPE "prioridad_lead" AS ENUM ('baja', 'media', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "tipo_google_integration" AS ENUM ('analytics', 'search_console', 'ads');

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "telefono" VARCHAR(20) NOT NULL,
    "localidad" VARCHAR(255),
    "direccion" VARCHAR(500),
    "servicios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estado" "estado_lead" NOT NULL DEFAULT 'nuevo',
    "fuente" "fuente_lead" NOT NULL DEFAULT 'landing',
    "landing_id" INTEGER,
    "utm_source" VARCHAR(100),
    "utm_medium" VARCHAR(100),
    "utm_campaign" VARCHAR(255),
    "utm_term" VARCHAR(255),
    "utm_content" VARCHAR(255),
    "presupuesto_enviado" DECIMAL(10,2),
    "fecha_presupuesto" TIMESTAMP(3),
    "importe_venta" DECIMAL(10,2),
    "fecha_venta" TIMESTAMP(3),
    "comision_calculada" DECIMAL(10,2),
    "comision_pagada" BOOLEAN NOT NULL DEFAULT false,
    "fecha_comision_pago" TIMESTAMP(3),
    "notas" TEXT,
    "prioridad" "prioridad_lead" NOT NULL DEFAULT 'media',
    "ip_origen" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landings" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "url" VARCHAR(500),
    "descripcion" TEXT,
    "api_key" VARCHAR(64) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "notificar_email" BOOLEAN NOT NULL DEFAULT true,
    "notificar_push" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "tipo" "tipo_actividad" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado_anterior" "estado_lead",
    "estado_nuevo" "estado_lead",
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMP(3),
    "tema" VARCHAR(20) NOT NULL DEFAULT 'system',
    "comision_por_defecto" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suscripciones_push" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" VARCHAR(255) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suscripciones_push_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_integrations" (
    "id" SERIAL NOT NULL,
    "tipo" "tipo_google_integration" NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "account_id" VARCHAR(255),
    "account_name" VARCHAR(255),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("config_key")
);

-- CreateIndex
CREATE INDEX "leads_estado_idx" ON "leads"("estado");

-- CreateIndex
CREATE INDEX "leads_fuente_idx" ON "leads"("fuente");

-- CreateIndex
CREATE INDEX "leads_landing_id_idx" ON "leads"("landing_id");

-- CreateIndex
CREATE INDEX "leads_created_at_idx" ON "leads"("created_at");

-- CreateIndex
CREATE INDEX "leads_telefono_idx" ON "leads"("telefono");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "landings_slug_key" ON "landings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "landings_api_key_key" ON "landings"("api_key");

-- CreateIndex
CREATE INDEX "landings_slug_idx" ON "landings"("slug");

-- CreateIndex
CREATE INDEX "landings_api_key_idx" ON "landings"("api_key");

-- CreateIndex
CREATE INDEX "actividades_lead_id_idx" ON "actividades"("lead_id");

-- CreateIndex
CREATE INDEX "actividades_tipo_idx" ON "actividades"("tipo");

-- CreateIndex
CREATE INDEX "actividades_created_at_idx" ON "actividades"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_token_key" ON "sesiones"("token");

-- CreateIndex
CREATE INDEX "sesiones_token_idx" ON "sesiones"("token");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_idx" ON "sesiones"("usuario_id");

-- CreateIndex
CREATE INDEX "sesiones_expires_at_idx" ON "sesiones"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_push_endpoint_key" ON "suscripciones_push"("endpoint");

-- CreateIndex
CREATE INDEX "suscripciones_push_usuario_id_idx" ON "suscripciones_push"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_integrations_tipo_key" ON "google_integrations"("tipo");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_landing_id_fkey" FOREIGN KEY ("landing_id") REFERENCES "landings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones_push" ADD CONSTRAINT "suscripciones_push_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
