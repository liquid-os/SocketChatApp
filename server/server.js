

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
  socket.on("selectgroup", function(data){
    //send back the list of channels on given group
    var group = getGroupByName(data[1])
    if(group != null){
      socket.emit("setgroup", data[1]);
      usr = getUserByName(data[0]);
      //channel_list = group.getChannelNamesForUser(usr);
      socket.emit("refreshchannels", [data[1], data[0]]);
      //socket.emit("showchannels", JSON.stringify(objectListToStrings(group.channelList)));
      if(group.isAssis(data[0])){
        socket.emit("setassis", 1);
      }else{
        socket.emit("setassis", 0);
      }
    }
  });
  socket.on("createuser", function(data){
    createUser(data[1], '', 0);
  });
  socket.on("deleteuser", function(data){
    deleteUser(data[1]);
  });
  socket.on("selectchannel", function(data){
    socket.emit("setchannel", data[1]);
  });
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
  socket.on("removechannel", function(data){
    //add group and send back to clients
    removeChannel(data[1], data[2]);
  });
  socket.on("givesuper", function(data){
    //add group and send back to clients
    usr = getUserByName(data[1]);
    if(usr == null){
      usr = createUser(data[1], '', 0);
    }
    usr.perms = 2;
    sendToUser(data[1], 'setperms', 2);
  });
  socket.on("givegroupadmin", function(data){
    //add group and send back to clients
    usr = getUserByName(data[1]);
    if(usr == null){
      usr = createUser(data[1], '', 0);
    }
    usr.perms = 1;
    sendToUser(data[1], 'setperms', 1);
    //socket.emit('setperms', [data[1], 1]);
  });
  socket.on("giveassis", function(data){
    //add group and send back to clients
    grp = getGroupByName(data[1]);
    usr = getUserByName(data[2]);
    if(usr == null){
      usr = createUser(data[2], '', 0);
    }
    grp.addAssis(usr);
    //socket.emit('setperms', [data[1], 1]);
  });
  socket.on("createchannel", function(data){
    //add group and send back to clients
    createChannel(data[0], data[1]);
    group = getGroupByName(data[0]);
    usr = getUserByName(data[2]);
    io.emit("refreshchannels", [data[0], data[2]]);
  });
  socket.on("refreshchannels", function(data){
    //add group and send back to clients
    group = getGroupByName(data[0]);
    if(group != null){
      usr = getUserByName(data[1]);
      rawlist = group.getChannelNamesForUser(usr);
      channel_list = JSON.stringify(rawlist);
      console.log(channel_list);
      socket.emit("showchannels", channel_list);
    }
  });
  socket.on("addfulluser", function(data){
    //add group and send back to clients
    var user = createUser(data.name, data.email, data.perms);
  });
  socket.on("addtochannel", function(data){
    var grp = getGroupByName(data[1]);
    var chan = data[2];
    var user = getUserByName(data[3]);
    if(user == null){
      user = createUser(data[3], '', 0);
    }
    grp.addUserToChannel(user, chan);
  });
  socket.on("removefromchannel", function(data){
    var grp = getGroupByName(data[1]);
    var chan = data[2];
    grp.removeUserFromChannel(data[3], chan);
  });
  socket.on("msg", function(data){
    //add group and send back to clients
    var group = getGroupByName(data.group);
    var channel = group.getChannelByName(data.channel);
    channel.messages.push(data.text);
    io.emit("msg", [group.name, channel.name, data.text]);
  });
});

function sendToUser(name, packetID, msg){
  var user = getUserByName(name);
  var id = 0;
  if(user != null){
    id = user.id;
    if(id != 0){
      io.to(id).emit(packetID, msg);
    }else{
      console.log("Tried to send packet to offline user.");
    }
  }
}

function deleteUser(name){
  io.emit('kick', name);
  var index = -1;
  for (var i = 0; i < this.users.length; i++) {
    var u = this.users[i];
    if(u.name == name){
      index = 1;
    }
  }
  if(index > -1){
    this.users.splice(index, 1);
  }
}

function removeGroup(name){
  var grp = getGroupByName(name);
  var index = 0;
  for (var i = 0; i < this.groups.length; i++) {
    grp = this.groups[i];
    if(grp.name == name){
      index = i;
    }
  }
  io.emit('kickfromgroup', name);
  this.groups.splice(index, 1);
}

function removeChannel(groupname, channelname){
  var grp = getGroupByName(groupname);
  var index_g = -1, index_c = -1;
  for (var i = 0; i < this.groups.length; i++) {
    grp = this.groups[i];
    if(grp.name == groupname){
      for (var j = 0; j < grp.channelList.length; j++) {
        index_g = i;
        var ch = grp.channelList[j];
        if(ch.name == channelname){
          index_c = j;
        }
      }
    }
  }
  this.io.emit('kickfromchannel', [groupname, channelname]);
  this.groups[index_g].channelList.splice(index_c, 1);
}

function getGroupChannelsForUser(username, groupname){
  var ret = [];
  var user = getUserByName(name);
  var group = getGroupByName(groupname);
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
  var grp = getGroupByName(groupname);
  var exist = false;
  if(grp != null){
    for (var i = 0; i < grp.channelList.length; i++) {
      ch = grp.channelList[i];
      if(ch.name == name){
        exist = true;
        return ch;
      }
    }
  }
  if(exist == false && grp != null){
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

  addAssis(user){
    if(this.isAssis(user.name) == false){
      this.assisList.push(user);
    }
    sendToUser(user.name, 'setassisforgrp', [this.name, 1]);
  }

  addUserToChannel(user, channel){
    var exists = false;
    var ch = this.getChannelByName(channel);
    if(ch != null){
      for (var i = 0; i < ch.users.length; i++) {
        var u = ch.users[i];
        if(u.name == user.name){
          exists = true;
        }
      }
    }
    if(!exists && ch != null){
      ch.users.push(user);
    }
  }

  removeUserFromChannel(username, channel){
    var index = -1;
    var ch = getChannelByName(channel);
    if(ch != null){
      for (var i = 0; i < ch.users.length; i++) {
        var u = ch.users[i];
        if(u.name == username){
          index = i;
        }
      }
    }
    if(index > -1 && ch != null){
      ch.users.splice(index, 1);
    }
    io.emit('refreshchannels', [this.name, username]);
  }

  getChannelNamesForUser(user){
    var ret = [];
    if(this.channelList.length > 0){
      for (var i = 0; i < this.channelList.length; i++) {
        ch = this.channelList[i];
        if(ch != null){
          var valid = false;
          for (var j = 0; j < ch.users.length; j++) {
            if(ch.users[j].name == user.name){
              valid = true;
            }
          }
          if(user.perms > 0 || valid == true){
            ret.push(ch.name);
          }
        }
      }
    }
    return ret;
  }

  getChannelByName(name){
    for (var i = 0; i < this.channelList.length; i++) {
      if(this.channelList[i].name == name){
        return this.channelList[i];
      }
    }
  }
}

groups = [];
users = [];

createGroup("General");
createGroup("Test");
createGroup("Admin");
createGroup("Help");

u = createUser('super', 'xyz@gmail.com', 2);

function createGroup(name){
  var group = new Group(name);
  this.groups.push(group);
}

function createUser(name, email, perms){
  var existing = getUserByName(name);
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
