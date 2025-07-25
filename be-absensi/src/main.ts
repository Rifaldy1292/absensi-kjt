import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const HOST = configService.get<string>('APP_HOST') || 'localhost';
  const PORT = configService.get<number>('PORT') || 3001;
  console.log(HOST, PORT);
  app.enableCors();
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(PORT, HOST, () => {
    const protocol =
      HOST === '0.0.0.0' ? 'http://<your-pc-ip>' : `http://${HOST}`;
    console.log(`🚀 Backend successfully started!`);
    console.log(`🌍 Accessible via: ${protocol}:${PORT}`);
    console.log(`📡 WebSocket enabled`);
    if (HOST === '0.0.0.0') {
      console.log(
        `✅ Public access enabled (LAN devices like phones can connect)`,
      );
    } else {
      console.log(`⚠️ Backend only accessible locally (localhost only)`);
    }
  });
}
bootstrap();
