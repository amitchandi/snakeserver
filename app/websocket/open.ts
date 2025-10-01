import { WebSocket } from "uWebSockets.js";
import { UserData } from "../types";
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

  const token = (ws.getUserData() as OpenUserData).token;

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err: any, decodedToken: any) => {
      jwtCallback(ws, err, decodedToken);
    },
  );
}

function jwtCallback(ws: WebSocket<unknown>, err: any, decodedToken: any) {
  if (err) {
    ws.end(1008, "Invalid or missing token");
  } else {
    activeUsers.set(decodedToken.id, ws);
    if (!queue.find((userId) => userId === decodedToken.id)) {
      const userData = ws.getUserData() as UserData;
      userData.userId = decodedToken.id;
      userData.username = decodedToken.username;
      addToQueue(decodedToken.id);
    }
  }
}
