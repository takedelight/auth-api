import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PrismaService } from './prisma/prisma.service';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const prismaService = app.get(PrismaService);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    credentials: true,
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
  });

  app.use(cookieParser());

  app.use(
    session({
      name: configService.getOrThrow<string>('SESSION_NAME'),
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: false,
      },
      store: new PrismaSessionStore(prismaService, {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: false,
        dbRecordIdFunction: undefined,
      }),
    }),
  );

  await app.listen(configService.getOrThrow<number>('PORT'), () =>
    console.log(
      ` App running on port http://localhost:${configService.getOrThrow<number>('PORT')}`,
    ),
  );
}
bootstrap().catch((e) => console.log(e));
