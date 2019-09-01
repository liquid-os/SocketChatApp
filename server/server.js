

var bodyParser = require('body-parser')
var express = require('express');


var app = express();

var server = app.listen(3000);

io = require('socket.io').listen(server);

console.log("Express server started.");

io.on('connection', function(socket){
  socket.on("login", function(data){
    user = createUser(data.name, data.email);
    createdUser = getUserByName(data.name);
    createdUser.id = socket.id;
    console.log(data.username);
    console.log(data.email);
    console.log(socket.id);
    console.log(createdUser.id);
    socket.emit("login", [createdUser.id, createdUser.perms]);
    //socket.emit("showgroups", getGroupNames());
  });
  socket.on("populate", function(data){
    //socket.emit("showgroups", getGroupNames());
    grpjson = JSON.stringify(groups);
    socket.emit("showgroups", grpjson);
  });
  socket.on("getchannels", function(data){
    //send back the list of channels on given group
    socket.emit("showchannel", objectListToStrings(getGroupByName(data).channelList));
  });
  socket.on("selectgroup", function(data){
    //send back the list of channels on given group
    console.log(data);
    socket.emit("setgroup", data);
    var group = getGroupByName(data)
    if(group != null)
      socket.emit("addchannels", objectListToStrings(group.channelList));
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
    io.emit("msg", [group.name, channel.name, data.text]);
  });
});

function sendToUser(name, packetID, msg){
  user = getUserByName(name);
  id = 0;
  if(user != null){
    id = user.id;
    io.to(id).emit(packetID, msg);
  }
}

function getGroupChannelsForUser(username, groupname){
  var ret = [];
  user = getUserByName(name);
  group = getGroupByName(groupname);
  for(ch in group.channelList){
    var isValid = false;
    for(u in ch.users){
      if(u.name == username){
        isValid = true;
      }
    }
    if(user.perms >= 1 || isValid){
      ret.push(ch.name);
    }
  }
  return ret;
}

function getGroupNames(){
  var ret = [];
  for(g in this.groups){
    ret.push(g.name);
    console.log(g.name);
  }
  return ret;
}

//perms: 0 = user, 1 = group admin, 2 = super admin
class User{
  constructor(name, email){
    this.name = name;
    this.id = 0;
    this.email = email;
    this.perms = 0;
  }
}

class Group{
  constructor(name){
    this.name = name;
    this.assisList = [];
    this.users = [];
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

function addToGroup(username, groupname){
  group = getGroupByName(groupname);
  user = getUserByName(username);
  group.users.push(user);
}

groups = ["g1", "g2", "g3", "g4"];
users = [];

function createGroup(name){
  group = new Group(name);
  this.groups.push(group);
}

function createUser(name, email){
  var existing = getUserByName(name);
  if(existing == null){
    new_user = new User(name);
    this.users.push(new_user);
    return new_user;
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
  for (var i = 0; i < this.groups.length; i++) {
    if(name == this.groups[i].name){
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
