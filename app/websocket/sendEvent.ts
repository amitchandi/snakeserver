import { WebSocket } from "uWebSockets.js";

export function sendEvent(ws: WebSocket<unknown>, event: any) {
  ws.send(JSON.stringify(event));
}
