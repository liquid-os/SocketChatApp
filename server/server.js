

var bodyParser = require('body-parser')
var express = require('express');


var app = express();

var server = app.listen(3000);

io = require('socket.io').listen(server);

console.log("Express server started.");

io.on('connection', function(socket){
  socket.on("login", function(data){
    user = createUser(data[0], data[1], 0);
    createdUser = getUserByName(data[0]);
    createdUser.id = socket.id;
    console.log(data.username);
    console.log(data.email);
    console.log(socket.id);
    console.log(createdUser.id);
    console.log(createdUser.perms);
    socket.emit("login", [createdUser.name, createdUser.perms]);
    //socket.emit("showgroups", getGroupNames());
  });
  socket.on("populate", function(data){
    //socket.emit("showgroups", getGroupNames());
    grpjson = JSON.stringify(getGroupNames());
    socket.emit("showgroups", grpjson);
  });
  socket.on("getchannels", function(data){
    //send back the list of channels on given group
    socket.emit("showchannels", objectListToStrings(getGroupByName(data).channelList));
  });
  socket.on("selectgroup", function(data){
    //send back the list of channels on given group
    var group = getGroupByName(data[1])
    if(group != null){
      socket.emit("setgroup", data[1]);
      socket.emit("showchannels", JSON.stringify(objectListToStrings(group.channelList)));
      if(group.isAssis(data[0])){
        socket.emit("setassis", 1);
      }else{
        socket.emit("setassis", 0);
      }
    }
  });
  socket.on("selectchannel", function(data){
    socket.emit("setchannel", data);
  }
  socket.on("creategroup", function(data){
    //add group and send back to clients
    createGroup(data);
    grpjson = JSON.stringify(getGroupNames());
    io.emit("showgroups", grpjson);
  });
  socket.on("removegroup", function(data){
    //add group and send back to clients
    removeGroup(data);
    grpjson = JSON.stringify(getGroupNames());
    io.emit("showgroups", grpjson);
  });
  socket.on("createchannel", function(data){
    //add group and send back to clients
    createChannel(data[0], data[1]);
    grpjson = JSON.stringify(getGroupNames());
    io.emit("showgroups", grpjson);
  });
  socket.on("adduser", function(data){
    //add group and send back to clients
    var user = createUser(data.name, data.email, data.perms);
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

function removeGroup(name){
  grp = getGroupByName(name);
  index = 0;
  for (var i = 0; i < this.groups.length; i++) {
    grp = this.groups[i];
    if(grp.name == name){
      index = i;
    }
  }
  io.emit('kickfromgroup', name);
  this.groups.splice(index, 1);
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

function createChannel(groupname, name){
  grp = getGroupByName(groupname);
  exist = false;
  if(grp != null){
    for (var i = 0; i < grp.channelList.length; i++) {
      ch = grp.channelList[i];
      if(ch.name == name){
        exist = true;
        return ch;
      }
    }
  }
  if(exist == false){
    ch = new Channel(name, groupname);
    grp.channelList.push(ch);
    return ch;
  }
}

function getGroupNames(){
  var ret = [];
  for (var i = 0; i < this.groups.length; i++) {
    ret.push(this.groups[i].name);
  }
  return ret;
}

//perms: 0 = user, 1 = group admin, 2 = super admin
class User{
  constructor(name, email, perms){
    this.name = name;
    this.id = 0;
    this.email = email;
    this.perms = perms;
  }
}

class Group{
  constructor(name){
    this.name = name;
    this.assisList = [];
    this.channelList = [];
  }

  isAssis(name){
    for(u in this.assisList){
        if(u.name == name){
          return true;
        }
    }
    return false;
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

groups = [];
users = [];

createGroup("General");
createGroup("Test");
createGroup("Admin");
createGroup("Help");

u = createUser('super', 'xyz@gmail.com', 2);

function createGroup(name){
  group = new Group(name);
  this.groups.push(group);
}

function createUser(name, email, perms){
  existing = getUserByName(name);
  if(existing == null){
    console.log("creating new user "+name);
    new_user = new User(name, email, perms);
    this.users.push(new_user);
    return new_user;
  }else{
    console.log("returning existing user");
    return existing;
  }
}

function getUserByName(name){
  for (var i = 0; i < this.users.length; i++) {
    if(this.users[i].name == name){
      console.log("existing user found");
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
