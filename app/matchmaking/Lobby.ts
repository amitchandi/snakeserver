import { UserDto } from "../models/User";
import { UserData } from "../types";
import { activeUsers } from ".";
import { app } from "../server";

export interface Lobby {
  id: string;
  players: string[];
  countdown?: NodeJS.Timeout; //
  playerObjects?: Map<string, UserDto>;
}

// export function lobbyPlayerLeave(lobby: Lobby) {
//   const players: string[] = [];
//   lobby.players.forEach(p => {
//     const ws = activeUsers.get(p);
//     if (!ws) return;
//     const userData = ws.getUserData() as UserData;
//     players.push(userData.username);
//   });

//   app.publish("lobby/" + lobby.id, JSON.stringify({
//     event: "lobbyPlayerLeave",
//     data: {
//       players
//     }
//   }));
// }
