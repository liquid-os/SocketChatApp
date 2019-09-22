

var bodyParser = require('body-parser')
var express = require('express');
var app = express();
var server = app.listen(3000);

// Init socket.io service
io = require('socket.io').listen(server);

console.log("Express server started.");

var MongoClient = require('mongodb').MongoClient;
var DB_NAME = "chat"
var url = "mongodb://localhost:27017/";

// This is the most important section in the server. Inside this io.on call, all the message
// handlers are established for the different kinds of packets that the server is ser up to receive.
io.on('connection', function(socket){
  socket.on("login", function(data){
    exists = userExists(data[0]);
    if(exists){
      user = getUserByName(data[0]);
      if(user.pword == ""){
        user.pword = data[2];
        socket.emit("login", [user.name, user.perms]);
      }else{
        if(user.pword == data[2]){
          socket.emit("login", [user.name, user.perms]);
        }else{
          socket.emit("unauth", [user.name]);
        }
      }
    }else{
      user = createUser(data[0], data[1], 0);
      createdUser = getUserByName(data[0]);
      createdUser.id = socket.id;
      createdUser.pword = data[2];
      socket.emit("login", [createdUser.name, createdUser.perms]);
    }
  });
  socket.on("populate", function(data){
    grpjson = JSON.stringify(getGroupNames());
    socket.emit("showgroups", grpjson);
  });
  socket.on("selectgroup", function(data){
    var group = getGroupByName(data[1])
    if(group != null){
      socket.emit("setgroup", data[1]);
      usr = getUserByName(data[0]);
      socket.emit("refreshchannels", [data[1], data[0]]);
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
  socket.on("message", function(data){
    usr = data[0];
    grpname = data[1];
    chname = data[2];
    msg = data[3];
    var chan = getGroupByName(grpname).getChannelByName(chname);
    chan.sendToChannel(usr, msg);
  });
  socket.on("selectchannel", function(data){
    socket.emit("setchannel", data[1]);

  });
  socket.on("creategroup", function(data){
    createGroup(data);
    grpjson = JSON.stringify(getGroupNames());
    io.emit("showgroups", grpjson);
  });
  socket.on("removegroup", function(data){
    removeGroup(data);
    grpjson = JSON.stringify(getGroupNames());
    io.emit("showgroups", grpjson);
  });
  socket.on("removechannel", function(data){
    removeChannel(data[1], data[2]);
  });
  socket.on("givesuper", function(data){
    usr = getUserByName(data[1]);
    if(usr == null){
      usr = createUser(data[1], '', 0);
    }
    usr.perms = 2;
    sendToUser(data[1], 'setperms', 2);
  });
  socket.on("givegroupadmin", function(data){
    usr = getUserByName(data[1]);
    if(usr == null){
      usr = createUser(data[1], '', 0);
    }
    usr.perms = 1;
    sendToUser(data[1], 'setperms', 1);
  });
  socket.on("giveassis", function(data){
    grp = getGroupByName(data[1]);
    usr = getUserByName(data[2]);
    if(usr == null){
      usr = createUser(data[2], '', 0);
    }
    grp.addAssis(usr);
  });
  socket.on("createchannel", function(data){
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
    //Create user using all parameters
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
    var group = getGroupByName(data.group);
    var channel = group.getChannelByName(data.channel);
    channel.messages.push(data.text);
    io.emit("msg", [group.name, channel.name, data.text]);
  });
});

function dbInsert(data){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_NAME);
    dbo.collection(table, function (err, collection) {
          collection.insertOne(data);
      });
  });
}

function dbUpdate(condition, qry){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_NAME);
    dbo.collection(table, function (err, collection) {
          collection.updateOne(
            {condition},
            {qry}
          );
      });
  });
}

function dbDelete(qry, table){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_NAME);
    dbo.collection(table, function (err, collection) {
          collection.remove(qry, true);
      });
  });
}

function dbSelect(qry, table){
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DB_NAME);
    dbo.collection(table, function (err, collection) {
          return collection.find(qry);
      });
  });
  return null;
}

// Sends a message to a specific user identified by their name
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

// Removes a user from the server, deleting all their permissions
// and channel rights.
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

// Removes a group from the server, kicking all users from the group
// and any subchannels of the group.
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

// Removes a channel from the server, kicking all users that are
// currently logged into it from the channel.
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

// Returns a list of all channels for the given group that a user
// has the correct permissions to view.
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

// Creates a new Channel object and pushes it to the channel list
// of the given group.
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

// Returns a string list of all group names
function getGroupNames(){
  var ret = [];
  for (var i = 0; i < this.groups.length; i++) {
    ret.push(this.groups[i].name);
  }
  return ret;
}

// Holds information for individual users
//perms: 0 = user, 1 = group admin, 2 = super admin
class User{
  constructor(name, email, perms){
    this.name = name;
    this.id = 0;
    this.pword = "";
    this.email = email;
    this.perms = perms;
  }

// Sets the password for this user
  setPass(pword){
    this.pword = pword;
    return this;
  }
}

// Holds information for groups
class Group{
  constructor(name){
    this.name = name;
    this.assisList = [];
    this.channelList = [];
  }

  // Returns true if the user with the given name is an assis for this group
  isAssis(name){
    for(u in this.assisList){
        if(u.name == name){
          return true;
        }
    }
    return false;
  }

  // Sets the user with the given name to be an assis for this group
  addAssis(user){
    if(this.isAssis(user.name) == false){
      this.assisList.push(user);
    }
    sendToUser(user.name, 'setassisforgrp', [this.name, 1]);
  }

  // Adds the given user to the given channel for this group
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

  // Removes the user with the given name from the given channel for this group
  removeUserFromChannel(username, channel){
    var index = -1;
    var ch = this.getChannelByName(channel);
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

  // Returns a list of channel names for the given user, for this group
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

  // Searches the channel list to locate a channel with name matching the given
  // parameter, and returns it (if one is found)
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

// Creates a new Group object and pushes it to the global group list
function createGroup(name){
  var group = new Group(name);
  this.groups.push(group);
}

function userExists(name){
  var existing = getUserByName(name);
  if(existing == null){
    return false;
  }else{
    return true;
  }
}

function setPerms(usrname, perm){
  var u = getUserByName(usrname);
  u.perms = perm;

}

// Creates a new user with the given parameters (unless one exists already
// with a matching name, in which case the function will return that user).
function createUser(name, email, perms, pass){
  var existing = getUserByName(name);
  if(existing == null){
    console.log("Creating new user "+name);
    new_user = new User(name, email, perms);
    new_user.password = pass;
    this.users.push(new_user);
    dbInsert("chat", "Users", {username: name, emailaddr: email, permmissions: perms, password: pass});
    return new_user;
  }else{
    return existing;
  }
}

// Searches the server for a user with name matching the given parameter.
// If one is found it will be returned.
function getUserByName(name){
  for (var i = 0; i < this.users.length; i++) {
    if(this.users[i].name == name){
      return this.users[i];
    }
  }
  return null;
}

// Searches the server for a group with name matching the given parameter.
// If one is found it will be returned.
function getGroupByName(name){
  for (var i = 0; i < this.groups.length; i++) {
    if(name == this.groups[i].name){
      return this.groups[i];
    }
  }
}

// Returns a list of strings using the given list
// and concatenating the 'name' token of each object.
function objectListToStrings(lst){
  var names = [];
  for (var i = 0; i < lst.length; i++) {
    names.push(lst[i].name);
  }
  return names;
}

// Holds information for subgroups/channels
class Channel{
  constructor(name, group){
    this.name = name;
    this.group = group;
    this.users = [];
    this.messages = [];
    this.currentUsers = [];
  }

  sendToChannel(usrname, txt){
    dbInsert("chat", "MessageHistory", {grp: this.group.name, chan: this.name, usr: usrname, msg: txt});
    for (var i = 0; i < this.currentUsers.length; i++) {
      var u = this.currentUsers[i];
      sendToUser(u.name, "msg", [usrname, txt]);
    }
  }
}
