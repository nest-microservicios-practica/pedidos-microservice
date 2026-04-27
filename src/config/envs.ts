import * as joi from "joi";
import 'dotenv/config';

interface EnvVariables {
  PORT: number;
  DATABASE_URL: string;
  // PRODUCTO_MICROSERVICE_HOST: string;
  // PRODUCTO_MICROSERVICE_PORT: number;
  NATS_SERVERS: string[];
}

const envSchema = joi.object({
  PORT: joi.number().required(),
  DATABASE_URL: joi.string().required(),
  // PRODUCTO_MICROSERVICE_HOST: joi.string().required(),
  // PRODUCTO_MICROSERVICE_PORT: joi.number().required(),
  NATS_SERVERS: joi.array().items(joi.string()).min(1).required(),
}).unknown(true);

const { error, value } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','), // esto lo hacemos para que lo pueda validar como un array, ya que no lo es
});

if (error) {
    const mensajes = error.details
        .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
    console.log('**** ERROR DE VARIABLES DE ENTORNO ****');
    console.log(mensajes);
  throw new Error(
      `Variables de entorno inválidas: ${error.message}`,
    );
}
const envVars: EnvVariables = value;

export const envs = {
  port: envVars?.PORT,
  databaseUrl: envVars?.DATABASE_URL,
  // productoMicroserviceHost: envVars?.PRODUCTO_MICROSERVICE_HOST,
  // productoMicroservicePort: envVars?.PRODUCTO_MICROSERVICE_PORT,
  natsServers: envVars?.NATS_SERVERS,
};
