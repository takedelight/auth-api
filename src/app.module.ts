import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    UserModule,
    AuthModule,
    PrismaModule,
    S3Module,
  ],
  controllers: [],
})
export class AppModule {}
