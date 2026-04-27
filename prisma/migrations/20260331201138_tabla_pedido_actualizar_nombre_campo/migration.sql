/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Pedido` table. All the data in the column will be lost.
  - Added the required column `montoTotal` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "totalAmount",
ADD COLUMN     "montoTotal" DOUBLE PRECISION NOT NULL;
