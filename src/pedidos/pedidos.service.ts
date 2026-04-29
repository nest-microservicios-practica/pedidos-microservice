import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

import { CambiarEstatusPedidoDto, CreatePedidoDto, PaginationPedidoDto, PedidoPagadoDto } from './dto/';
import { PrismaService } from 'src/prisma.service';
import { NATS_SERVICE } from 'src/config';
import { PedidoConProductos } from './interfaces';

@Injectable()
export class PedidosService {
  private logger = new Logger('PedidosService');

  constructor(
    private prisma: PrismaService,
    // @Inject(PRODUCTO_MICROSERVICE) private readonly productosCliente: ClientProxy
    @Inject(NATS_SERVICE) private readonly cliente: ClientProxy
  ) { }

  async create(createPedidoDto: CreatePedidoDto) {
    // 1. Validamos que los productos por id existen en el microservicio de productos
    const ids = createPedidoDto.items.map(item => item.productoId);
    // como el .send retorna un observable, para poder utilizar la data esperando, debemos llamar a firstValueFrom para que espere
    const productos = await firstValueFrom(
      this.cliente.send({ cmd: 'validar_productos_por_ids' }, ids).pipe(
        catchError((error) => { throw new RpcException(error); })
      )
    );

    try {
      // 2. calculamos los totales de la factura o pedido
      const totalItems = createPedidoDto.items.reduce((acc, item) => acc + item.cantidad, 0);
      const montoTotal = createPedidoDto.items.reduce((acc, item) => {
        const producto = productos.find(p => p.id === item.productoId);
        if (producto) {
          return acc + producto.precio * item.cantidad;
        }
        return acc;
      }, 0);

      // 3. creamos una transaccion de base de datos. para este caso no se necesita, ya que las tablas estan relacionadas entre si y prisma lo sabe
      const pedido = await this.prisma.pedido.create({
        data: {
          totalItems,
          montoTotal,
          PedidoItems: {
            createMany: {
              data: createPedidoDto.items.map(item => ({
                productoId: item.productoId,
                cantidad: item.cantidad,
                precio: productos.find(p => p.id === item.productoId)?.precio || 0
              }))
            }
          }
        },
        // lo siguiente es para hacer que, como luego de insertar en pedido me retorna el pedido creado, quiero que me traiga los items del pedido relacionados
        include: {
          // PedidoItems: true 'o' lo siguiente
          PedidoItems: {
            select: {
              id: true,
              productoId: true,
              cantidad: true,
              precio: true
            },
          }
        }
      });

      return {
        ...pedido,
        PedidoItems: pedido.PedidoItems.map(item => ({
          ...item,
          nombre: productos.find(p => p.id === item.productoId)?.nombre || ''
          // producto: productos.find(p => p.id === item.productoId)
        }))
      };
    } catch (error) {
      console.log({error});
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Problema al tratar de crear el pedido',
      });
    }
  }

  async findAll(paginationPedidoDto: PaginationPedidoDto) {
    const totalPages = await this.prisma.pedido.count({
      where: {
        status: paginationPedidoDto.status
      }
    });

    const paginaActual = paginationPedidoDto.page || 1;
    const perPage = paginationPedidoDto.limit || 10;
    const data = await this.prisma.pedido.findMany({
      skip: (paginaActual - 1) * perPage,
      take: perPage,
      where: {
        status: paginationPedidoDto.status
      }
    });

    return {
      data,
      meta: {
        total: totalPages,
        page: paginaActual,
        lastPage: Math.ceil(totalPages / perPage)
      }
    }
  }

  async findOne(id: string) {
    const pedidoAndItems = await this.prisma.pedido.findUnique({ where: { id }, include: { PedidoItems: true } }); // PedidoItems es para que me traiga el contenido de esa tabla relacionada
    const ids = pedidoAndItems?.PedidoItems.map(item => item.productoId) || [];
    // traigo la data del otro microservicio, si no la encuentra lanza una exception
    const productos = await firstValueFrom(
      this.cliente.send({ cmd: 'validar_productos_por_ids' }, ids).pipe(
        catchError((error) => { throw new RpcException(error); })
      )
    );

    
    if (!pedidoAndItems) {
      throw new RpcException({
        message: `Pedido ${id} no encontrado`,
        status: HttpStatus.NOT_FOUND
      });
    }
    return {
      ...pedidoAndItems,
      PedidoItems: pedidoAndItems.PedidoItems.map(item => ({
        ...item,
        nombre: productos.find(p => p.id === item.productoId)?.nombre || ''
      }))
    };
  }

  async cambiarEstatusPedido(cambiarEstatusPedidoDto: CambiarEstatusPedidoDto) {
    const { id, status } = cambiarEstatusPedidoDto;
    const pedido = await this.findOne(id); // Verificar que el pedido existe, si no lanza una excepción
    if (pedido.status === status) {
      return pedido;
    }
    try {
      return await this.prisma.pedido.update({
        where: { id },
        data: { status: status },
      });
    } catch (error) {
      throw new RpcException({
        message: `Error al cambiar el estado del pedido ${id}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }


  // este metdo es para comunicarse con el microservicio de pagos y crear una sesion de pago en stripe,
  // para eso le envio la data del pedido con productos,
  // y el microservicio de pagos se encarga de crear la sesion de pago en stripe y retornar la url de la sesion de pago
  //  -- esto ya seria tarea de un fronent para que el cliente pueda redirigir al usuario a esa url y realizar el pago
  async crearSesionDePago(pedidoConProductos: PedidoConProductos) {
    const productos = await firstValueFrom(
      this.cliente.send('create.pago.session', {
        pedidoId: pedidoConProductos.id,
        currency: 'USD', // dolares
        items: pedidoConProductos.PedidoItems.map(item => ({
          name: item.nombre,
          price: item.precio,
          quantity: item.cantidad
        }))
      }).pipe(
        catchError((error) => { throw new RpcException(error); })
      )
    );
    return productos;
  }




  // este metodo es para procesar el evento que emite el microservicio de pagos cuando se realiza un pago exitoso, y actualizar el estado del pedido a 'pagado' o algo similar
  async pagoRealizado(payload: PedidoPagadoDto) {
    this.logger.log('Procesando pago realizado para pedidoId:', {payload});
    
    // aqui hacemos los dos insert al mismo tiempo, esto es como una transaccion
    // const pedidoActualizado =  
    await this.prisma.pedido.update({
      where: { id: payload.pedidoId },
      data: {
        status: 'PAGADO',
        pagado: true,
        pagadoEn: new Date(),
        stripePagoId: payload.stripePagoId,
        PedidoRecibos: {
          create: {
            reciboUrl: payload.reciboPagoURL
          }
        }
      },
      include: {
        PedidoRecibos: true
      } 
    });
    return
  }
}
