import { PedidoStatus } from "generated/prisma/enums";


export interface PedidoConProductos {
  PedidoItems: {
    nombre: any;
    id: string;
    productoId: number;
    cantidad: number;
    precio: number;
  }[];
  id: string;
  montoTotal: number;
  totalItems: number;
  status: PedidoStatus;
  pagado: boolean;
  pagadoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}