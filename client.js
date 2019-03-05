let userObj = {
	uuid: "",
	nickname: getCookie("nickname"),
	colour: getCookie("nickColour")
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

//code from W3 schools modified for own use
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

//Gets value of cookie. If not set, returns ""
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

// function checkCookie() {
// 	var user = getCookie("nickname");
// 	if (user != "") {
// 		//Do something when we have a username already
// 	} else {
// 		user = prompt("Please enter your name:", "");
// 		if (user != "" && user != null) {
// 			setCookie("nickname", user, 30);
// 		}
// 	}
// }


function prepChatMsg(msgText) {
	message = new Message(msgText, userObj.nickname, userObj.uuid, userObj.colour);
	dateTest = message;
	return message;
}

function getTimestamp(dateStr) {
	timestamp = "";
	dateObj = new Date(dateStr);
	timestamp += dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds();
	return timestamp;
}

function getChatMsg(msg) {
	chatline = "";
	chatline += getTimestamp(msg.date) + " " + "<span style='color:#" + msg.colour + "'>" + msg.nickname + "</span>" + ": " + msg.text;
	return chatline;
}

$(document).ready(() => {
	var socket = io();

	//Check cookie on load to initialize
	//checkCookie();

	socket.on("request userObj", function(newUserObj){
		console.log("Sending userObj update...");
		socket.emit("send userObj", userObj);
	});

	//emit chat message
	$('form').submit(function (e) {
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', prepChatMsg($('#m').val()));
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function (msg) {
		// $('#messages').append($('<li>').text(msg.text));
		$('#messages').append($('<li>').html(getChatMsg(msg)));
		$('#chat').scrollTop($("#chat")[0].scrollHeight);
	});

	socket.on('message log', function (messageHistory) {
		for (i = 0; i < messageHistory.length; i++) {
			$('#messages').append($('<li>').html(getChatMsg(messageHistory[i])));
			$('#chat').scrollTop($("#chat")[0].scrollHeight);
		}
	});

	socket.on('nick change', function (newNick) {
		userObj.nickname = newNick;
		console.log("Nick changed to: " + userObj.nickname);
		$('#nav').text("Welcome " + userObj.nickname);
		setCookie("nickname", newNick, 30);
	});

	socket.on('nick colour', function (newColour) {
		userObj.colour = newColour;
		setCookie("nickColour", newColour, 30);
	});

	//Update user list
	socket.on('user update', function (userList) {
		$('#userlist').empty();
		for (i = 0; i < userList.length; i++) {
			$('#userlist').append($('<li>').html("<span style='color:#" + userList[i].colour + "'>" + userList[i].nickname + "</span>"));
		}
	});

	//Update this users id
	socket.on("id update", function (newID) {
		userObj.uuid = newID;
	});

});