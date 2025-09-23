import { WebSocket } from "uWebSockets.js";
import { UserData } from "../types";
import { components } from "../components";

const maxBackPressure: number = process.env.MAX_BACKPRESSURE! || 1024;

export function drain(ws: WebSocket<unknown>) {
  // handle backpressure, im not sure if this even works
  console.log("WebSocket backpressure: " + ws.getBufferedAmount());
  if (ws.getBufferedAmount() < maxBackPressure) {
    const userData = ws.getUserData() as UserData;
    components[userData.event!](userData.data!, ws);
    userData.event = undefined;
    userData.data = undefined;
  }
}
