import { WebSocket } from "uWebSockets.js";

export function subscription(ws: WebSocket<unknown>, topic: ArrayBuffer, newCount: number, oldCount: number) {
  // could be useful. not sure yet.
  // const decoder = new TextDecoder();
  // console.log(`Subscribed to ${decoder.decode(topic)}`);
  // console.log(`new count ${newCount}`);
  // console.log(`old count ${oldCount}`);
}
