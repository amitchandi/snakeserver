import { WebSocket } from "uWebSockets.js";
import { UserData } from "../types";
import { sendEvent } from "./sendEvent";
import jwt from "jsonwebtoken";
import {
  queue,
  activeUsers,
  addToQueue,
} from "../matchmaking";

interface OpenUserData {
  url: string;
  token: string;
  id: string;
  username: string;
  email: string;
}

export function open(ws: WebSocket<unknown>) {
  // Authenticate with request headers
  console.log("WebSocket opened");
  // console.log("token: " + JSON.stringify(ws.getUserData()));

  const token = (ws.getUserData() as OpenUserData).token;
  jwt.verify(
    token,
    process.env.JWT_SECRET!,
    (err: any, decodedToken: any) => {
      if (err) {
        ws.close();
      } else {
        activeUsers.set(decodedToken.id, ws);
        if (!queue.find((userId) => userId === decodedToken.id)) {
          const userData = ws.getUserData() as UserData;
          userData.userId = decodedToken.id;
          userData.username = decodedToken.username;
          addToQueue(decodedToken.id);
        }
      }
    },
  );

  sendEvent(ws, {
      event: "chatMessage",
      data: {
        args: {
          username: "server",
          message: "Hello",
        }
      },
    });
}
