import { Controller, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PedidosService } from './pedidos.service';
import { CambiarEstatusPedidoDto, CreatePedidoDto, PaginationPedidoDto, UpdatePedidoDto } from './dto';

@Controller()
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @MessagePattern('createPedido')
  create(@Payload() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @MessagePattern('findAllPedidos')
  findAll(@Payload() paginationPedidoDto: PaginationPedidoDto) {
    return this.pedidosService.findAll(paginationPedidoDto);
  }

  @MessagePattern('findOnePedido')
  findOne(@Payload() id: string) {
    return this.pedidosService.findOne(id);
  }

  @MessagePattern('cambiarEstatusPedido')
  cambiarEstatusPedido(
    @Payload() cambiarEstatusPedidoDto: CambiarEstatusPedidoDto
  ) {
    return this.pedidosService.cambiarEstatusPedido(cambiarEstatusPedidoDto)
  }
}
