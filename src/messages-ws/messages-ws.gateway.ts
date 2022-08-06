import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces';
import { NewMesageDto } from './dtos/new-message.dato';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({cors : true})
export class MessagesWsGateway implements OnGatewayConnection,OnGatewayDisconnect{

 @WebSocketServer() wss : Server;

  constructor(private readonly messagesWsService: MessagesWsService,
    private readonly jwtService : JwtService
    ) {}
 async  handleConnection(client:  Socket, ...args: any[]) {
   const token = client.handshake.headers.authentication as string ;
   let payload : JwtPayload;

   try {
    payload =  this.jwtService.verify(token);
   await  this.messagesWsService.registerClient(client,payload.id);
     
   } catch (error) {
      client.disconnect();
      return ; 
   }

  console.log( {payload});
    // console.log('Client Connect',client.id)
   
    this.wss.emit('clients-updated',this.messagesWsService.getConnectedClients());
// console.log({'connec' : this.messagesWsService.getConnectedClients()})
    
  }

  handleDisconnect(client: Socket) {
    //  console.log('Client Disconnect ',client.id)
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated',this.messagesWsService.getConnectedClients());
    // console.log({'connec' : this.messagesWsService.getConnectedClients()})
  }


@SubscribeMessage('message-from-client')
onMessageFromClient(client:  Socket, payload : NewMesageDto){

// console.log(client.id,payload);

//! Alone to emit client
// client.emit('message-from-server',{fullName : 'Soy Yo!',message : payload.message || 'no-message!!'});

//! Emit to All Clients  less to  the client  emit message 
// client.broadcast.emit('message-from-server',{fullName : 'Soy Yo!',message : payload.message || 'no-message!!'});



this.wss.emit('message-from-server',{fullName : this.messagesWsService.getUserFullName(client.id),message : payload.message || 'no-message!!'});

}




}
