import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Biar semua frontend bisa konek. Di production, sebaiknya di-restrict.
  },
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Fungsi ini bisa dipanggil dari service/controller
  sendRfidData(data: any) {
    this.server.emit('rfidDetected', data);
  }
  sendUpdateLogNotification(data: object) {
    console.log('Notifikasi update log ditampilkan', data);
    return this.server.emit('updateLogNotification', data);
  }
}
