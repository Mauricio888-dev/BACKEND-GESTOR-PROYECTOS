import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'http://localhost:5173',
      'http://localhost:3009',
      'http://192.168.19.106:4200',
      'http://192.168.19.114:4200',
      'http://192.168.19.103:4200',
      'https://ndlh927t-4200.use2.devtunnels.ms'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();