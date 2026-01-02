import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    credentials: true,
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
  });

  await app.listen(configService.getOrThrow<number>('PORT'), () =>
    console.log(configService.getOrThrow<number>('PORT')),
  );
}
bootstrap().catch((e) => console.log(e));
