import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket : any;
  readonly server_url = 'localhost:3000';

  constructor() {
    this.socket = io(this.server_url);
  }

  listen(eventName : string){
    return new Observable((subscriber) =>{
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      })
    });
  }

  send(eventName, data : any){
    this.socket.emit(eventName, data);
  }
}
