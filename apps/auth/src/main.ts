// import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';


async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
