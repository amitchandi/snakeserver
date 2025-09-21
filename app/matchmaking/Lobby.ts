interface Lobby {
  id: string;
  players: string[];
  state: "waiting" | "in-game";
  maxPlayers: number;
  minPlayers: number;
  countdown?: NodeJS.Timeout; // reference to timer
}
