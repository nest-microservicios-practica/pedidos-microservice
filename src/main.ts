import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Pedidos-Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen();
  // este es microservicio que se comunica por mensajes mediante nats, no expone un puerto para recibir peticiones http, 
  // si quereremos poder recibir peticiones http tendriamos que agregar el puerto en el envs, en el main.ts, en el docker-compose.yml y en el docker-compose.prod.yml, y luego usar app.listen(port) para que escuche en ese puerto, quedando como un microservicio hibrido, ejemplo de esto es el microservicio de pagos
  // MICROSERVICIO PAGOS ES EJEMPLO DE MICRO SERVICIO HIBRIDO, YA QUE FUNCIONA CON NATS Y EXPONE PUERTO PARA PETICIONES HTTP AL QUE PODEMOS LLAMAR DIRECTAMENTE DESDE POTMAN SIN PASAR POR EL CLIENTE-GATEWAY
  // logger.log(`Microservice running on port ${envs.port}`);
}
bootstrap();
