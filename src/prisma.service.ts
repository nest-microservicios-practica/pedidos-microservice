import { Injectable, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';
import { envs } from './config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    // PrismaPg es solo para conectarnos a postgres
    const adapter = new PrismaPg(envs.databaseUrl ?? '');
    super({ adapter });
  }
}