import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type RedisClientType, createClient } from 'redis';
import { Session } from 'src/types/session.type';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor(readonly configService: ConfigService) {
    this.redisClient = createClient({
      socket: {
        host: this.configService.getOrThrow<string>('REDIS_HOST'),
        port: this.configService.getOrThrow<number>('REDIS_PORT'),
      },
    });
  }

  async onModuleInit() {
    this.redisClient.on('error', (e) => console.log('Redis Error:', e));

    await this.redisClient.connect();
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  getClient() {
    return this.redisClient;
  }

  async getSession(rawSid: string): Promise<Session | null> {
    const cleanSid = rawSid.replace(/^s:/, '').split('.')[0];

    const key = `sess:${cleanSid}`;

    const data = await this.redisClient.get(key);

    return data ? (JSON.parse(data) as Session) : null;
  }
}
