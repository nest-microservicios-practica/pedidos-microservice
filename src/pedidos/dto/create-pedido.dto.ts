import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { PedidoItemDto } from "./pedido-item.dto";
import { Type } from "class-transformer";

export class CreatePedidoDto {
  // listado de productos
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true }) // para que valide cada elemento del array
  @Type(() => PedidoItemDto) // para que transforme cada elemento del array a PedidoItemDto
  items: PedidoItemDto[];
}
