import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const redisClient = createClient({
    socket: {
      host: 'localhost',
      port: configService.getOrThrow<number>('REDIS_PORT'),
    },
  });

  redisClient.connect().catch(console.error);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    credentials: true,
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
  });

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      name: configService.getOrThrow<string>('SESSION_NAME'),
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      },
    }),
  );

  app.use(cookieParser());

  await app.listen(configService.getOrThrow<number>('PORT'), () =>
    console.log(configService.getOrThrow<number>('PORT')),
  );
}
bootstrap().catch((e) => console.log(e));
