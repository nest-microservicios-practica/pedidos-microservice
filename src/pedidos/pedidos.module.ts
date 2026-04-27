import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaService } from 'src/prisma.service';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PedidosController],
  providers: [PedidosService, PrismaService],
  imports: [
    NatsModule
  ],
})
export class PedidosModule {}
