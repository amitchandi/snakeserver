export interface Lobby {
  id: string;
  players: string[];
  countdown?: NodeJS.Timeout; //
}
