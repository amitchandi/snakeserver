import uWS, { WebSocket } from "uWebSockets.js";
import { StringDecoder } from "string_decoder";
import { Room, UserData } from "./types";
import { components, rooms, users } from "./components";
import { AddRoutes } from "./routes";
import { toInGameUserDto } from "./models/User";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import { Lobby } from "./matchmaking/Lobby";
import console from "console";

const decoder = new StringDecoder("utf8");

const maxBackPressure = 1024;

// Map of userId → WebSocket
export const activeUsers: Map<string, WebSocket<UserData>> = new Map();
// Queue of waiting players
let queue: string[] = []; // store userIds
// Active lobbies
const waitingLobbies: Map<string, Lobby> = new Map();
const inGameLobbies: Map<string, Lobby> = new Map();

function lobbyTimerFN(lobbyId: string) {
  console.log(new Date() + `: Lobby ${lobbyId} timeout finished`);

  app.publish("lobby/" + lobbyId, JSON.stringify({
    event: "game_start",
    data: {},
  }));
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

function tryCreateLobby() {

  if (queue.length >= MIN_PLAYERS) {
    // Take up to MAX_PLAYERS from queue
    const players = queue.splice(0, Math.min(queue.length, MAX_PLAYERS));

    // Generate a unique ID for the lobby
    const lobbyId = v4();
    const lobby: Lobby = {
      id: lobbyId,
      players,
      state: "waiting",
      countdown: setTimeout(() => lobbyTimerFN(lobbyId), 5 * 1000),
    };
    // lobbies.set(lobbyId, players);
    waitingLobbies.set(lobbyId, lobby);

    // Notify each player
    players.forEach(p => {
      const ws = activeUsers.get(p);
      if (!ws) return;

      ws.subscribe("lobby/" + lobbyId);

      // ws.send(JSON.stringify({
      //   action: "lobby_start",
      //   lobbyId,
      // }));
    });

    app.publish("lobby/" + lobbyId, JSON.stringify({
      event: "lobby_found",
      data: {}
    }))

    console.log(new Date() + `: Lobby ${lobbyId} created.`);
  }
}

// an "app" is much like Express.js apps with URL routes,
// here we handle WebSocket traffic on the wildcard "/*" route
const app = uWS.App().ws("/*", {
  // handle messages from client
  maxBackpressure: maxBackPressure,
  idleTimeout: 120,
  maxPayloadLength: 64 * 1024, // 64 Mb
  open: (ws) => {
    // Authenticate with request headers
    console.log("WebSocket opened");
    console.log("token: " + JSON.stringify(ws.getUserData()));
    //TODO: implement actual type
    //@ts-ignore
    const token = ws.getUserData().token;
    jwt.verify(token, process.env.JWT_SECRET!, (err: any, decodedToken: any) => {
      if (err) {
        ws.close();
      } else {
        console.log(decodedToken)
        activeUsers.set(decodedToken.id, ws as WebSocket<UserData>);
        if (!queue.find((userId) => userId === decodedToken.id)) {
          queue.push(decodedToken.id);
          //TODO: optionally broadcast queue length
          if (waitingLobbies.size == 0)
            tryCreateLobby();
          else {
            // push player into existing lobby
            const lobby = waitingLobbies.values().next().value as Lobby;
            queue.splice(queue.indexOf(decodedToken.id), 1);
            lobby.players.push(decodedToken.id);
          }
        }
      }
    })

    ws.send(
      JSON.stringify({
        event: "echo",
        data: {
          msg: "Hello",
        },
      }),
    );
  },
  message: (ws, message, isBinary) => {
    if (!isBinary) {
      let json = JSON.parse(decoder.write(Buffer.from(message)));

      try {
        if (ws.getBufferedAmount() < maxBackPressure) {
          components[json.event](json.data, ws);
        } else {
          const userData = ws.getUserData() as UserData;
          userData.event = json.event;
          userData.data = json.data;
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      console.log("binary");
    }
  },
  drain: (ws) => {
    // handle backpressure, im not sure if this even works
    console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    if (ws.getBufferedAmount() < maxBackPressure) {
      const userData = ws.getUserData() as UserData;
      components[userData.event!](userData.data!, ws);
      userData.event = undefined;
      userData.data = undefined;
    }
  },
  close: async (ws, code, message) => {
    /* The library guarantees proper unsubscription at close */
    console.log(code);
    if (code === 1000 || code === 1001 || code === 1006) {
      const userData = ws.getUserData() as UserData;
      console.log(userData);
      if (userData.userId !== null && userData.deviceId !== null) {
        const res = await users.getUserById(userData.userId!);
        if (!res) {
          console.log("User not found");
          return;
        }
        const user = toInGameUserDto(res);
        let _rooms = rooms.getRooms(null, undefined);
        _rooms.forEach((room, roomId) => {
          if (room.users.has(user._id.toString())) {
            console.log(userData.userId + " delete from " + roomId);
            room.users.delete(user._id.toString());
          }
        });
      }
    }

    if (code === 1006) {
      console.log(message);
      console.log(ws);
    }
  },
  upgrade: (res, req, context) => {
    console.log("upgrade");
    // console.log(res);
    // console.log(req);
    // console.log(context);

    // console.log(req.getHeader("sec-websocket-key"));
    // console.log(req.getHeader("sec-websocket-protocol"));
    // console.log(req.getHeader("sec-websocket-extensions"));

    /* This immediately calls open handler, you must not use res after this call */
    res.upgrade(
      {
        url: req.getUrl() /* First argument is UserData (see WebSocket.getUserData()) */,
        // query: req.getQuery(),
        token: req.getHeader("sec-websocket-protocol")
      },
      /* Spell these correctly */
      req.getHeader("sec-websocket-key"),
      req.getHeader("sec-websocket-protocol"),
      req.getHeader("sec-websocket-extensions"),
      context,
    );
  },
});

AddRoutes(app, components);

export { app };
