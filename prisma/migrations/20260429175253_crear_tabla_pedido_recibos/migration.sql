-- AlterEnum
ALTER TYPE "PedidoStatus" ADD VALUE 'PAGADO';

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "stripePagoId" TEXT;

-- CreateTable
CREATE TABLE "pedido_recibos" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "reciboUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_recibos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedido_recibos_pedidoId_key" ON "pedido_recibos"("pedidoId");

-- AddForeignKey
ALTER TABLE "pedido_recibos" ADD CONSTRAINT "pedido_recibos_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
