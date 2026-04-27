import { Catch, ArgumentsHost, ExceptionFilter, Logger } from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcCustomExceptionFilter');
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    this.logger.error('RpcCustomExceptionFilter');
    const response = ctx.getResponse();

    const rpcError = exception.getError();
    console.log({ rpcError });

    if (
      typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const status = isNaN(Number(rpcError.status)) ? 400 : Number(rpcError.status);
      return response.status(status).json(rpcError);
    }

    // si es un error desconocido, el profesor lanzar 400, pero yo lanzaria un 500 porque no es controlado
    return response.status(400).json({
      status: 400,
      message: rpcError,
    });
  }
}