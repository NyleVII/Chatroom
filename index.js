var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const express = require('express');
const uuid = require('uuid');

class UserObj {
    constructor(uuid) {
        this.uuid = uuid;
        this.name = "Anonymous";
    }
}

let userList = {};

function updateUserNames(userList){
    let userNames = [];

    for (var key in userList) {

        var obj = userList[key];
        for (var prop in obj) {
            // skip loop if the property is from prototype
            if(!obj.hasOwnProperty(prop)) continue;
    
            // your code
            if(prop == "name"){
                userNames.push(obj[prop]);
            }
        }
    }
    console.log(userNames);
    return userNames;
}

app.use(express.static("./"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	console.log('a user connected');
    
    var newID = uuid.v4();
    socket.emit("id update", newID); //Send ID to user
    userObj = new UserObj(newID);
    userList[userObj.uuid] = userObj;
    console.log(userList);
    io.emit('user update', updateUserNames(userList)); //Send userList to all connected users

	//When user disconnects
    socket.on('disconnect', function () {
        console.log('user disconnected');
        delete userList.newID;
        console.log(userList);
        io.emit('user update', updateUserNames(userList)); //Send userList to all connected users
    });
});

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        nickChange = msg.split(" ");
        if (msg === "") {
            //Do nothing
        }
        else if (nickChange[0] === "/nick") {
            socket.emit('nick change', nickChange[1]);
            io.emit('user update', updateUserNames(userList)); //Send userList to all connected users
        }
        else {
            io.emit('chat message', msg);
        }

    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});