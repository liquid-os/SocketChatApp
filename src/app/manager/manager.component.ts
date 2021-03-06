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

  messages = [];


  selectedGroup = "";
  selectedChannel = "";
  text_group = "";
  text_channel = "";
  text_user = "";
  text_msg = "";

  currentGroup = "";
  currentChannel = "";

  isAssis = false;

  selectGroup(){
    this.socketService.send("selectgroup", [this.username, this.selectedGroup]);
  }

  selectChannel(){
    this.socketService.send("selectchannel", [this.username, this.selectedChannel, this.currentGroup]);
  }

  sendMessage(){
    this.socketService.send("message", [this.currentGroup, this.currentChannel, this.username, this.text_msg]);
  }

  createGroup(){
    if(this.text_group == ""){
      alert("Please enter a group name into the text field!");
    }else{
      this.socketService.send("creategroup", this.text_group);
      this.text_group = "";
    }
  }

  removeGroup(){
    if(this.text_group == ""){
      alert("Please enter a group name into the text field!");
    }else{
      this.socketService.send("removegroup", this.text_group);
      this.text_group = "";
    }
  }

  createChannel(){
    this.socketService.send("createchannel", [this.currentGroup, this.text_channel, this.username]);
    this.text_channel = "";
  }

  leaveChannel(){
    this.currentChannel = "";
  }

  leaveGroup(){
    this.currentGroup = "";
    this.currentChannel = "";
    this.isAssis = false;
  }

  removeChannel(){
    this.socketService.send('removechannel', [this.username, this.currentGroup, this.currentChannel]);
    this.text_channel = "";
  }

  clearMessages(){
    this.messages.length = 0;
  }

  uploadAvatar(){
  }

  logout(){
    this.socketService.send('rawmessage', [this.username, this.currentGroup, this.currentChannel, this.username+" has left the chat."]);
    localStorage.setItem('username', "");
    localStorage.setItem('perms', '0');
    this.router.navigate(['/', 'login']);
  }

  createUser(){
    this.socketService.send('createuser', [this.username, this.text_user]);
  }

  deleteUser(){
    this.socketService.send('deleteuser', [this.username, this.text_user]);
  }

  addUserToChannel(){
    this.socketService.send('addtochannel', [this.username, this.currentGroup, this.currentChannel, this.text_user]);
  }

  removeUserFromChannel(){
    this.socketService.send('removefromchannel', [this.username, this.currentGroup, this.currentChannel, this.text_user]);
  }

  giveSuperAdmin(){
    this.socketService.send('givesuper', [this.username, this.text_user]);
  }

  giveGroupAdmin(){
    this.socketService.send('givegroupadmin', [this.username, this.text_user]);
  }

  giveGroupAssis(){
    this.socketService.send('giveassis', [this.username, this.currentGroup, this.text_user]);
  }


  constructor(private socketService : WebSocketService, private router : Router) {}

  ngOnInit() {
    this.channels = [];
    this.perms = parseInt(localStorage.getItem('perms'));
    this.username = localStorage.getItem('username');
    this.socketService.send('populate', '');
    this.socketService.listen('event').subscribe((data : any)=>{
       console.log(data);
    });
    this.socketService.listen('showgroups').subscribe((data : any)=>{
       this.groups = [];
       var glist = JSON.parse(data);
       for(var i = 0; i < glist.length; ++i){
         this.groups.push(glist[i]);
       }
    });
    this.socketService.listen('setgroup').subscribe((data : string)=>{
      if(this.currentGroup != data){
        this.currentGroup = data;
        this.currentChannel = "";
        this.clearMessages();
      }
    });
    this.socketService.listen('setchannel').subscribe((data : string)=>{
       this.currentChannel = data;
       this.socketService.send('rawmessage', [this.username, this.currentGroup, this.currentChannel, this.username+" has joined the chat."]);
       this.clearMessages();
    });
    this.socketService.listen('kick').subscribe((data : string)=>{
      if(this.username == data){
       this.logout();
       this.clearMessages();
     }
    });
    this.socketService.listen('setassis').subscribe((data : number)=>{
      if(data == 0){
        this.isAssis = false;
      }else{
        this.isAssis = true;
      }
    });
    this.socketService.listen('setperms').subscribe((data : number)=>{
      localStorage.setItem('perms', (""+data));
       this.perms = data;
    });
    this.socketService.listen('kickfromgroup').subscribe((data : string)=>{
      if(this.currentGroup == data){
        alert("You have been kicked from the group!");
        if(this.currentChannel != ""){
          this.socketService.send('rawmessage', [this.username, this.currentGroup, this.currentChannel, this.username+" has left the chat."]);
        }
        this.currentGroup = "";
        this.currentChannel = "";
        this.clearMessages();
        this.isAssis = false;
      }
    });
    this.socketService.listen('kickfromchannel').subscribe((data : any[])=>{
      if(this.currentGroup == data[0] && this.currentChannel == data[1]){
        alert("You have been kicked from the channel!");
        this.socketService.send('rawmessage', [this.username, this.currentGroup, this.currentChannel, this.username+" has left the chat."]);
        this.currentGroup = "";
        this.currentChannel = "";
        this.clearMessages();
        this.isAssis = false;
      }
    });
    this.socketService.listen('setassisforgrp').subscribe((data : any[])=>{
      if(this.currentGroup == data[0]){
        this.isAssis = (data[1] == 1);
      }
    });
    this.socketService.listen('message').subscribe((data : any[])=>{
      if(this.currentGroup == data[1] && this.currentChannel == data[2]){
        this.messages.push(data[3]);
      }
    });
    this.socketService.listen('refreshchannels').subscribe((data : string[])=>{
      if(data[0] == this.currentGroup){
        this.channels = [];
        this.socketService.send('refreshchannels', [data[0], this.username]);
        this.clearMessages();
      }
    });
    this.socketService.listen('showchannels').subscribe((data : any)=>{
      var chlist = JSON.parse(data);
      //if(grp == this.currentGroup){
        for(var i = 0; i < chlist.length; ++i){
          console.log(chlist[i]);
          this.channels.push(chlist[i]);
        }
      //}
    });
  }
}
