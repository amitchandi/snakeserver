import { UserDto } from "../models/User";

export interface Lobby {
  id: string;
  players: string[];
  countdown?: NodeJS.Timeout; //
  playerObjects: Record<string, UserDto>;
  wallsToStart: number;
}
