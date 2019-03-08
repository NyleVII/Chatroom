var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const express = require('express');
const uuid = require('uuid');

class UserObj {
    constructor(uuid, nick) {
        this.uuid = uuid;
        this.nickname = nick;
        this.colour = "FFFFFF"
    }
}

class Message {
    constructor(str, nickname, uuid, colour) {
        this.text = str;
        this.date = new Date();
        this.nickname = nickname;
        this.uuid = uuid;
        this.colour = colour;
    }
}

//Dictionary of UserObj
let userList = {};

let userCount = 0;

//array of Message
let messageHistory = [];

function getNewNick() {
    userCount += 1;
    return "User" + userCount;
}

function getUserNames(userList) {
    let userNames = [];

    for (var key in userList) {
        var obj = userList[key];
        for (var prop in obj) {
            // skip loop if the property is from prototype
            if (!obj.hasOwnProperty(prop)) continue;

            // compare to nickname to only push it once
            if (prop == "nickname") {
                tempObj = {};
                tempObj.nickname = obj.nickname;
                tempObj.colour = obj.colour
                userNames.push(tempObj);
                // userNames.push(obj[prop]);
            }
        }
    }
    //console.log(userNames);
    return userNames;
}

app.use(express.static("./"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    //User Connection Setup
    let newID = uuid.v4();
    let userObj = new UserObj(newID, getNewNick());
    socket.emit("id update", newID); //Send ID to user
    socket.emit("request userObj", userObj);

    
    userList[userObj.uuid] = userObj;
    //console.log(userList);
    //Send newly connected user the userlist
    io.emit('user update', getUserNames(userList)); //Send userList to all connected users

    //Send newly connected user the userlist
    socket.emit('message log', messageHistory);

    socket.on("send userObj", function(newUserObj){
        let userObj = new UserObj(newUserObj.uuid, newUserObj.nickname);
        userObj.colour = newUserObj.colour;
        if(userObj.nickname === ""){
            userObj.nickname = getNewNick();
        }
        userList[userObj.uuid] = userObj;
        socket.emit('nick change', userObj.nickname);
        io.emit('user update', getUserNames(userList)); //Send userList to all connected users
    });

    //When user disconnects
    socket.on('disconnect', function () {
        console.log('user disconnected');
        console.log('Deleting user: ' + newID);
        delete userList[newID];
        //console.log(userList);
        io.emit('user update', getUserNames(userList)); //Send userList to all connected users
    });

    socket.on('chat message', function (msg) {
        nickChange = msg.text.split(" ");
        if (msg.text === "") {
            //Do nothing
        }
        else if (nickChange[0] === "/nick") {
            currentNicks = getUserNames(userList);
            console.log(currentNicks);
            let nickTaken = false;
            for(let i = 0; i < currentNicks.length; i++){
                if(currentNicks[i].nickname.includes(nickChange[1])){
                    nickTaken = true;
                }
            }
            if(nickTaken === true){
                socket.emit('nick change fail', "Username " + nickChange[1] + " is taken.");
            }
            else{
                socket.emit('nick change', nickChange[1]);
                userList[msg.uuid].nickname = nickChange[1];
                io.emit('user update', getUserNames(userList)); //Send userList to all connected users
            }
            
        }
        else if (nickChange[0] === "/nickcolor" || nickChange[0] === "/nickcolour") {
            userList[msg.uuid].colour = nickChange[1];
            console.log(userList[msg.uuid].colour);
            socket.emit('nick colour', nickChange[1]);
            io.emit('user update', getUserNames(userList)); //Send userList to all connected users
        }
        else {
            messageHistory.push(msg);
            io.emit('chat message', msg);
        }

    });

});



http.listen(3000, function () {
    console.log('listening on *:3000');
});