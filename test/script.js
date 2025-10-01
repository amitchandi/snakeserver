// 'ws://localhost:9001'
var ws;
var user;
var room;
var lobby = null;

function main() {
  let token = "";
  let ws;
  /* Connect to the server 206.189.73.177:80 */

  //ws = new CustomWebSocket('206.189.73.177:80');
  // ws = new CustomWebSocket('localhost:9001');
}

var getRooms = async function () {
  var rooms = await ws.getRooms();
  console.log(rooms);
  document.getElementById("rooms").innerHTML = JSON.stringify(rooms);
};

var eatPellet = function () {
  ws.send("eatPellet", {
    lobbyId: lobby.id,
    args: {
      userId: user.id,
      magnitude: document.getElementById("magnitude").value,
    },
  });
};

var die = function () {
  ws.send("die", {
    lobbyId: lobby.id,
    userId: user.id,
    args: {
      userId: user.id,
      username: user.name,
    },
  });
};

var zoom = function () {
  ws.send("zoom", {
    lobbyId: lobby.id,
    args: {
      userId: user.id,
    },
  });
};

// var sendReadyChange = function(setFalse) {
//     ws.send('setReadyStatus', {
//         lobbyId: lobby.id,
//         userId: user.id,
//         args: {
//             userId: user.id,
//             isReady: setFalse ? false : !user.isReady
//         }
//     });
// }

var sendChatMessage = function () {
  var message = document.getElementById("message");
  ws.send("chatMessage", {
    lobbyId: lobby.id,
    args: {
      username: user.name,
      message: message.value,
    },
  });
  message.value = "";
};
// var startGame = function() {
//     ws.send('startGame', {
//         lobbyId: lobby.id,
//         args: {}
//     });
// }

async function login() {
  const loginData = {
    email: currentLogin.email,
    password: currentLogin.password,
  };
  console.log(loginData);
  let myHeaders = new Headers();
  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(loginData),
  };

  let response = await sendHTTPRequest("/login", requestOptions);
  console.log(response);
  if (response.valid) {
    user = {
      id: response.userId,
      email: response.email,
      username: response.username,
      wins: response.wins,
      gamesPlayed: response.gamesPlayed
    }
    token = response.token;
    document.getElementById("token").innerHTML = "True";
    document.getElementById("loginrow").title =
      "Logged in as " + loginData.email + "\nToken: " + token;
    document.getElementById("btn_login").setAttribute("disabled", "disabled");
    document.getElementById("loginSelect").setAttribute("disabled", "disabled");
    document.getElementById("btn_logout").removeAttribute("disabled");

    document.getElementById("user_id").innerText = response.userId;
    document.getElementById("user_email").innerText = response.email;
    document.getElementById("user_username").innerText = response.username;
    document.getElementById("user_wins").innerText = response.wins;
    document.getElementById("user_games_played").innerText = response.gamesPlayed;
  } else {
    console.log("Login failed");
  }
}

let baseAddress = "localhost:9001";

async function sendHTTPRequest(action, requestOptions) {
  let res = await fetch("http://" + baseAddress + action, requestOptions)
    .then((response) => {
      console.log(response);
      return response.text();
    })
    .catch((error) => console.log("error", error));
  // console.log(room);
  return JSON.parse(res);
}

const logins = [
  {
    email: "asd@asd.com",
    password: "asd"
  },
  {
    email: "asd1@asd.com",
    password: "asd",
  },
  {
    email: "asd2@asd.com",
    password: "asd",
  }
];
let currentLogin = logins[0];
function loginChange() {
  currentLogin = logins[document.getElementById("loginSelect").selectedIndex];
}

function joinQueue() {
  if (!ws) {
    connectWebSocket();
  } else {
    console.log(ws)
  }
}

function connectWebSocket() {
  ws = new CustomWebSocket("localhost:9001", token);

  ws.binaryType = "arraybuffer";

  ws.bind("close", function (data) {
    console.log("close");
    console.log(data);
  });

  // ws.bind('getRooms', function(data) {
  //     console.log(data);
  // });

  // ws.bind('joinRoom', function(data) {
  //     console.log(data);
  //     room = data['room'];
  //     document.getElementById('Room_Data').innerHTML = JSON.stringify(room);
  // });

  ws.bind("createUser", function (data) {
    console.log(data);
  });

  ws.bind("getUser", function (data) {
    console.log(data);
  });

  ws.bind("startGame", function (data) {
    console.log(data);
    logToChat("game start");
  });

  ws.bind("eatPellet", function (data) {
    console.log(data);
  });

  ws.bind("die", function (data) {
    console.log(data);
  });

  ws.bind("chatMessage", function (data) {
    logToChat(data.args.username + ": " + data.args.message);
  });

  // ws.bind('reset', async function(data) {
  //     console.log(data);
  //     sendReadyChange(true);
  //     await getUser('456');
  // });

  ws.bind("ping", function (data) {
    console.log(data);
  });

  ws.bind("echo", function (data) {
    console.log(data);
  });

  //Lobby
  ws.bind("lobbyJoined", function (data) {
    console.log(data.lobby);
    lobby = data.lobby;
  });

  ws.bind("lobbyPlayers", function (data) {
    console.log(data);
    document.getElementById("lobbyPlayers").innerHTML = data.players.map(player => `<li>${player}</li>`).join('\n');
  });

  function logToChat(message) {
    document.getElementById("chatlog").value += "\n" + message;
  }
}
