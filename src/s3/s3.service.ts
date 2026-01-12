import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({
      region: configService.getOrThrow<string>('S3_REGION'),
      endpoint: `https://${configService.getOrThrow<string>('SUPABASE_PROJECT_ID')}.supabase.co/storage/v1/s3`,
      credentials: {
        accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: configService.getOrThrow<string>('S3_SECRET_KEY'),
      },
      forcePathStyle: true,
    });

    this.bucketName = configService.getOrThrow<string>('S3_BUCKET_NAME');
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads') {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${this.bucketName}/${fileName}`;
  }

  async deleteFile(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
  }
}
