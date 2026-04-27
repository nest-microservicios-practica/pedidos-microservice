import { Module } from '@nestjs/common';
import { PedidosModule } from './pedidos/pedidos.module';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [
    PedidosModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
