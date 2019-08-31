import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {

  perms = 1;
  groups = ["test", "bing", "bong"];
  channels = [];
  selectedGroup = "";
  selectedChannel = "";

  currentGroup = "";
  currentChannel = "";

  constructor(private socketService : WebSocketService) {}

  ngOnInit() {
    this.socketService.listen('event').subscribe((data)=>{
       console.log(data);
    });
    this.socketService.listen('addgroup').subscribe((data)=>{
       this.groups.push(data.name);
    });
    this.socketService.listen('addchannel').subscribe((data)=>{
       this.groups.push(data.name);
    });
  }
}
