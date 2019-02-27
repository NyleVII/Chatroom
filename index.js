var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const express = require('express');

let userList = ["user1", "user2"];

app.use(express.static("./"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	console.log('a user connected');
	io.emit('user update', userList);

	//When user disconnects
    socket.on('disconnect', function () {
        console.log('user disconnected');
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
        }
        else {
            io.emit('chat message', msg);
        }

    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});