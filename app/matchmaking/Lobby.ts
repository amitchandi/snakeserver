export interface Lobby {
  id: string;
  players: string[];
  state: "waiting" | "ingame";
  // maxPlayers: number;
  // minPlayers: number;
  countdown?: NodeJS.Timeout; //
}
