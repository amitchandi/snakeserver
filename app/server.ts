import uWS, { WebSocket } from "uWebSockets.js";
import { StringDecoder } from "string_decoder";
import { Room, UserData } from "./types";
import { components, rooms, users } from "./components";
import { AddRoutes } from "./routes";

const decoder = new StringDecoder("utf8");

const maxBackPressure = 1024;

// Map of userId → WebSocket
export const activeUsers: Map<string, WebSocket<UserData>> = new Map();
// Queue of waiting players
let queue: string[] = []; // store userIds
// Active lobbies
const lobbies: Map<string, Lobby> = new Map();

// an "app" is much like Express.js apps with URL routes,
// here we handle WebSocket traffic on the wildcard "/*" route
const app = uWS.App().ws("/*", {
  // handle messages from client
  maxBackpressure: maxBackPressure,
  idleTimeout: 120,
  maxPayloadLength: 64 * 1024, // 64 Mb
  open: (ws) => {
    // Authenticate with request headers
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
        let user = await users.getUserById(userData.userId!);
        if (!user) {
          console.log("User not found");
          return;
        }
        if (user !== undefined) {
          let _rooms: { [key: string]: Room } | undefined = rooms.getRooms(
            null,
            undefined,
          );
          for (let roomId in _rooms) {
            let room = _rooms[roomId];
            if (room.users.has(user._id.toString())) {
              console.log(userData.userId + " delete from " + roomId);
              room.users.delete(user._id.toString());
            }
          }
        }
      }
    }

    if (code === 1006) {
      console.log(message);
      console.log(ws);
    }
  },
  upgrade: (res, req, context) => {
    console.log("upgrade");
    console.log(res);
    console.log(req);
    console.log(context);

    /* This immediately calls open handler, you must not use res after this call */
    res.upgrade({
        myData: req.getUrl() /* First argument is UserData (see WebSocket.getUserData()) */
      },
      /* Spell these correctly */
      req.getHeader('sec-websocket-key'),
      req.getHeader('sec-websocket-protocol'),
      req.getHeader('sec-websocket-extensions'),
      context
    );
  },
});

AddRoutes(app, components);

export { app };
