-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('PENDIENTE', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "status" "PedidoStatus" NOT NULL,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "pagadoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);
