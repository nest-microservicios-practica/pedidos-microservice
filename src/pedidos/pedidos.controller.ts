import { Controller, Query } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { PedidosService } from './pedidos.service';
import { CambiarEstatusPedidoDto, CreatePedidoDto, PaginationPedidoDto, PedidoPagadoDto, UpdatePedidoDto } from './dto';
import { PedidoConProductos } from './interfaces';


//! importante, solo los controle pueden escuchar eventos, los servicios no
@Controller()
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  //! IMPORTANTE SI DAMOS CLICK en la url de pago y queremos pagar,
  // podemos utilizar las tarjetas de prueba que ofrece Stripe para simular pagos exitosos, ejemplo la tarjeta '4242 4242 4242 4242'
  @MessagePattern('createPedido')
  async create(@Payload() createPedidoDto: CreatePedidoDto) {
    const pedido =  await this.pedidosService.create(createPedidoDto);
    const pagoSession = await this.pedidosService.crearSesionDePago(pedido);
    return {
      pedido,
      pagoSession
    };
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


  // pago.realizado
  //!!!!!!!!!!! ESCUCHANDO EVENTO DEL MICROSERVICIO PAGOS
  //! imporntante, es un EventPattern, no un MessagePattern,
  // ya que este evento lo emitira el microservicio de pagos, y el microservicio de pedidos solo escuchara ese evento para actualizar el estado del pedido a 'pagado' o algo similar, pero no necesita responder nada al microservicio de pagos, por eso es un EventPattern y no un MessagePattern
  @EventPattern('pago.realizado')
  async pagoRealizado(@Payload() payload: PedidoPagadoDto) {
    return this.pedidosService.pagoRealizado(payload);
  }
}
