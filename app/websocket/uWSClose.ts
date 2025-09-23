import { WebSocket } from "uWebSockets.js";
import { UserData } from "../types";
import { activeUsers, lobbies } from "../matchmaking";
import { toInGameUserDto } from "../models/User";

export async function uWSClose(ws: WebSocket<unknown>, code: number, message: ArrayBuffer) {
  /* The library guarantees proper unsubscription at close */
  console.log("close");
  console.log(code);
  if (code === 1000 || code === 1001 || code === 1006) {
    const userData = ws.getUserData() as UserData;
    console.log("userData");
    console.log(userData);
    if (userData.userId) {
      activeUsers.delete(userData.userId);
      // TODO: Implement remove player from lobby

      // const res = await users.getUserById(userData.userId!);
      // if (!res) {
      //   console.log("User not found");
      //   return;
      // }
      // const user = toInGameUserDto(res);
      // lobbies.delete(user._id);
    }
  }

  // dont remember what this is
  if (code === 1006) {
    console.log(message);
    console.log(ws);
  }
}
