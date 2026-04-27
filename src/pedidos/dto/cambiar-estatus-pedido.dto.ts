import { IsEnum, IsUUID } from "class-validator";
import { PedidoStatus } from "generated/prisma/enums";
import { PedidoStatusList } from "../enum/pedido.enum";

export class CambiarEstatusPedidoDto {
    @IsUUID('4', {
        message: 'debe ser un UUID válido'
    })
    id: string;

    @IsEnum(PedidoStatusList, {
        message: `Estado del pedido no válido, debe ser uno de: ${Object.values(PedidoStatusList).join(', ')}`
    })
    status: PedidoStatus;
}   