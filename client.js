let userObj = {
	uuid: "",
	nickname: "Anonymous",
	colour: "black"
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

let dateTest;

function prepChatMsg(msgText){
	message = new Message(msgText, userObj.nickname, userObj.uuid, userObj.colour);
	dateTest = message;
	return message;
}

function getTimestamp(dateStr){
	timestamp = "";
	dateObj = new Date(dateStr);
	timestamp += dateObj.getHours() + ":" + dateObj.getMinutes() + ":" +dateObj.getSeconds();
	return timestamp;
}

function getChatMsg(msg){
	chatline = "";
	chatline += getTimestamp(msg.date) + " " + msg.nickname + ": " + msg.text;
	return chatline;
}

$(document).ready(() => {
	var socket = io();

	$('form').submit(function (e) {
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', prepChatMsg($('#m').val()));
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function (msg) {
		// $('#messages').append($('<li>').text(msg.text));
		$('#messages').append($('<li>').text(getChatMsg(msg)));
		$('#chat').scrollTop($("#chat")[0].scrollHeight);
	});

	socket.on('message log', function(messageHistory){
		for(i = 0; i < messageHistory.length; i++){
			$('#messages').append($('<li>').text(getChatMsg(messageHistory[i])));
			$('#chat').scrollTop($("#chat")[0].scrollHeight);
		}
	});

	socket.on('nick change', function (newNick) {
		userObj.nickname = newNick;
		console.log("Nick changed to: " + userObj.nickname);
		$('#nav').text("Welcome " + userObj.nickname);
	});

	//Update user list
	socket.on('user update', function (userList){
		console.log(userList);
		$('#userlist').empty();
		for(i = 0; i < userList.length; i++){
			$('#userlist').append($('<li>').text(userList[i]));
		}
	});

	//Update this users id
	socket.on("id update", function(newID){
		userObj.uuid = newID;
	});

});