let userObj = {
	uuid: "",
	nickname: "Anonymous"
}

$(document).ready(() => {
	var socket = io();
	$('form').submit(function (e) {
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function (msg) {
		$('#messages').append($('<li>').text(msg));
		$('#chat').scrollTop($("#chat")[0].scrollHeight);
	});

	socket.on('nick change', function (newNick) {
		userObj.nickname = newNick;
		console.log("Nick changed to: " + userObj.nickname);
		$('#nav').text("Welcome " + userObj.nickname);
	});

	//Update user list
	socket.on('user update', function (userList){
		for(i = 0; i < userList.length; i++){
			$('#users').append($('<li>').text(userList[i]));
		}
	});

});