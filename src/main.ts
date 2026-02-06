import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cors({
      origin: [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        'http://localhost:5173',
        'http://localhost:3009',
        'http://192.168.19.176:4200',
        'http://192.168.19.114:4200',
        'http://192.168.19.103:4200',
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );
  await app.listen( 3000);
}
bootstrap();