import { WebSocket } from "uWebSockets.js";
import { StringDecoder } from "string_decoder";
import { components } from "../components";
import { UserData, WSMessage } from "../types";

const maxBackPressure: number = process.env.MAX_BACKPRESSURE! || 1024;
const decoder = new StringDecoder("utf8");

export function message(ws: WebSocket<unknown>, message: ArrayBuffer, isBinary: boolean) {
  if (!isBinary) {
    let json = JSON.parse(decoder.write(Buffer.from(message))) as WSMessage;

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
    console.log(message);
  }
}
