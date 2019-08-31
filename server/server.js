

var bodyParser = require('body-parser')
var express = require('express');


var app = express();

var server = app.listen(3000);

io = require('socket.io').listen(server);

console.log("Express server started.");

io.on('connection', function(socket){
  socket.on("login", function(data){
    var ip = socket.request.connection.remoteAddress;
    console.log(data.username);
    console.log(data.email);
    socket.emit("getchannels", objectListToStrings(getGroupByName(data).channelList));
  });
  socket.on("getchannels", function(data){
    //send back the list of channels on given group
    socket.emit("getchannels", objectListToStrings(getGroupByName(data).channelList));
  });
  socket.on("getchannels", function(data){
    //send back the list of channels on given group
    socket.emit("getchannels", objectListToStrings(getGroupByName(data).channelList));
  });
  socket.on("addgroup", function(data){
    //add group and send back to clients
    createGroup(data);
    socket.emit("addgroup", objectListToStrings(getGroupByName(data).channelList));
  });
  socket.on("adduser", function(data){
    //add group and send back to clients
    var user = createUser(data.name, data.email);
  });
  socket.on("msg", function(data){
    //add group and send back to clients
    var group = this.getGroupByName(data.group);
    var channel = group.getChannelByName(data.channel);
    channel.messages.push(data.text);
    io.emit("msg", {'group':(group.name) 'channel':(channel.name), 'text':(data.text)});
  });
});


//perms: 0 = user, 1 = group admin, 2 = super admin
class User{
  constructor(name, email){
    this.name = name;
    this.email = email;
    this.perms = 0;
  }
}

class Group{
  constructor(name){
    this.name = name;
    this.assisList = [];
    this.channelList = [];
  }

  getChannelByName(name){
    for (var i = 0; i < this.channelList.length; i++) {
      if(this.channelList[i] == name){
        return this.channelList[i];
      }
    }
  }

}

groups = [];

users = [];

function createGroup(group){
  this.groups.push(group);
}

function createUser(name, email){
  var existing = getUserByName(name);
  if(existing == null){
    new_user = new User()
  }else{
    return existing;
  }
}



function getUserByName(name){
  for (var i = 0; i < this.users.length; i++) {
    if(this.users[i].name == name){
      return this.users[i];
    }
  }
  return null;
}

function getGroupByName(name){
  n = name.toUpperCase();
  for (var i = 0; i < this.groups.length; i++) {
    if(n == this.groups[i].name){
      return this.groups[i];
    }
  }
}

function objectListToStrings(lst){
  var names = [];
  for (var i = 0; i < lst.length; i++) {
    names.push(lst[i].name);
  }
  return names;
}

class Channel{
  constructor(name, group){
    this.name = name;
    this.group = group;
    this.users = [];
    this.messages = [];
  }
}

function doLogin(name, email){

}
