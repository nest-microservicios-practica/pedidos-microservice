import { IsString, IsUrl, IsUUID } from "class-validator";

export class PedidoPagadoDto {
    @IsString()
    @IsUUID()
    pedidoId: string;

    @IsString()
    stripePagoId: string;

    @IsString()
    @IsUrl()
    reciboPagoURL: string;
}