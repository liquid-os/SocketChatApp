import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {

  perms = 1;
  groups = [];
  channels = [];
  username = "";


  selectedGroup = "";
  selectedChannel = "";
  text_group = "";
  text_channel = "";
  text_user = "";

  currentGroup = "";
  currentChannel = "";

  isAssis = false;

  selectGroup(){
    this.socketService.send("selectgroup", [this.username, this.selectedGroup]);
  }

  selectChannel(){
    this.socketService.send("selectchannel", this.selectedChannel);
  }

  createGroup(){
    if(text_group == ""){
      alert("Please enter a group name into the text field!");
    }else{
      this.socketService.send("creategroup", this.text_group);
      this.text_group = "";
    }
  }

  removeGroup(){
    if(text_group == ""){
      alert("Please enter a group name into the text field!");
    }else{
      this.socketService.send("removegroup", this.text_group);
      this.text_group = "";
    }
  }

  addUserToChannel(){

  }

  removeUserFromChannel(){

  }

  createChannel(){
    this.socketService.send("createchannel", [this.currentGroup, this.text_channel]);
    this.text_channel = "";
  }

  removeChannel(){

  }

  logout(){
    localStorage.setItem('username', "");
    localStorage.setItem('perms', 0);
    this.router.navigate(['/', 'login']);
  }


  constructor(private socketService : WebSocketService, private router : Router) {}

  ngOnInit() {
    this.perms = parseInt(localStorage.getItem('perms'));
    this.username = localStorage.getItem('username');
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
    this.socketService.listen('setchannel').subscribe((data)=>{
       this.currentGroup = data;
    });
    this.socketService.listen('setassis').subscribe((data)=>{
      if(data == 0){
        this.isAssis = false;
      }else{
        this.isAssis = true;
      }
    });
    this.socketService.listen('setperms').subscribe((data)=>{
      localStorage.setItem('perms', data);
       this.perms = data;
    });
    this.socketService.listen('kickfromgroup').subscribe((data)=>{
      if(this.currentGroup == data){
        alert("You have been kicked from the group!");
        this.currentGroup = "";
        this.currentChannel = "";
        this.isAssis = false;
      }
    });
    this.socketService.listen('kickfromchannel').subscribe((data)=>{
      if(this.currentGroup == data){
        alert("The have been kicked from the channel!");
        this.currentGroup = "";
        this.currentChannel = "";
        this.isAssis = false;
      }
    });
    this.socketService.listen('showchannels').subscribe((data)=>{
      this.channels = [];
      var clist = JSON.parse(data);
      for(var i = 0; i < clist.length; ++i){
        this.channels.push(clist[i]);
      }
    });
  }
}
