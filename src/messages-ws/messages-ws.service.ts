import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnecttedClients {
    [id:string] : { socket : Socket, user : User}
}



@Injectable()
export class MessagesWsService {

   constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>){}

  private connectClient : ConnecttedClients = {}

   async registerClient(client : Socket,userId : string ){

     const user =  await this.userRepository.findOneBy({id : userId});

     if(!user) throw new Error('User not found');
     if(!user.isActive) throw new Error ('User is not active');
 
      this.checkUserConnection(user);


           this.connectClient[client.id] = {
            socket: client ,
            user : user
           };
   }

   removeClient(clientId : string){
      delete this.connectClient[clientId];
   }

   getConnectedClients(): string[] {
      
      return Object.keys(this.connectClient);
   }

   getUserFullName(socketId : string){
      return this.connectClient[socketId].user.fullName;
   }

   private checkUserConnection(user : User){
      for(const clientId of Object.keys(this.connectClient)){
         const connectedClient = this.connectClient[clientId];
          
            if(connectedClient.user.id === user.id){
               connectedClient.socket.disconnect();
               break;
            }

      }
   }
}
