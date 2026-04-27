import { Type } from "class-transformer";
import { IsNumber, IsPositive } from "class-validator";

export class PedidoItemDto {

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    productoId: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    cantidad: number;

    // el precio no porque lo obtenemos del microservicio de productos
    // @IsNumber()
    // @IsPositive()
    // precio: number;
}
