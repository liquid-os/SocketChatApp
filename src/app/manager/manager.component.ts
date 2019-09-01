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
  groups = [];
  channels = [];
  selectedGroup = "";
  selectedChannel = "";

  currentGroup = "";
  currentChannel = "";

  isAssis = false;

  selectGroup(){
    this.socketService.send("selectgroup", this.selectedGroup);
  }

  selectChannel(){
    this.socketService.send("selectchannel", this.selectedChannel);
  }

  constructor(private socketService : WebSocketService) {}

  ngOnInit() {
    this.socketService.send('populate', '');
    this.socketService.listen('event').subscribe((data)=>{
       console.log(data);
    });
    this.socketService.listen('showgroups').subscribe((data)=>{
       this.groups = [];
       var glist = JSON.parse(data);
       for(var i = 0; i < glist.length; ++i){
         this.groups.push(glist[i]);
       }
    });
    this.socketService.listen('setgroup').subscribe((data)=>{
       this.currentGroup = data;
    });
    this.socketService.listen('addchannels').subscribe((data)=>{
      this.channels = [];
       for(var chan in data){
         this.channels.push(chan);
       }
    });
  }
}
