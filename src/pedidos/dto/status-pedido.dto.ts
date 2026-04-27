import { IsEnum, IsOptional } from "class-validator";
import { PedidoStatus, PedidoStatusList } from '../enum/pedido.enum';

export class StatusPedidoDto {
    @IsOptional()
    @IsEnum(PedidoStatusList, {
        message: `Estado del pedido no válido, debe ser uno de: ${Object.values(PedidoStatus).join(', ')}`
    })
    estado: PedidoStatus;
}