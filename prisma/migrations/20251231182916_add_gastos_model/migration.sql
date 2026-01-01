-- CreateEnum
CREATE TYPE "tipo_gasto" AS ENUM ('anuncios', 'desplazamiento', 'material', 'comision_plataforma', 'otro');

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "tipo" "tipo_gasto" NOT NULL,
    "concepto" VARCHAR(255) NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "landing_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gastos_tipo_idx" ON "gastos"("tipo");

-- CreateIndex
CREATE INDEX "gastos_fecha_idx" ON "gastos"("fecha");

-- CreateIndex
CREATE INDEX "gastos_landing_id_idx" ON "gastos"("landing_id");

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_landing_id_fkey" FOREIGN KEY ("landing_id") REFERENCES "landings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
