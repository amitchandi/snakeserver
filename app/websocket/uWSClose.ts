import { WebSocket } from "uWebSockets.js";
import { UserData } from "../types";
import { activeUsers, lobbies, publishLobbyPlayers } from "../matchmaking";

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

      if (!userData.lobbyId) return;
      const lobby = lobbies.get(userData.lobbyId);
      if (!lobby) return;

      lobby.playerObjects?.delete(userData.userId);
      console.log("lobby.playersObjects");
      console.log(lobby.playerObjects);
      lobby.players?.splice(lobby.players.indexOf(userData.userId), 1);
      console.log("lobby.players");
      console.log(lobby.players);
      publishLobbyPlayers(lobby);
    }
  }

  // dont remember what this is
  if (code === 1006) {
    console.log(message);
    console.log(ws);
  }
}
