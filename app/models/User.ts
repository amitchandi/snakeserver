import { WithId } from "mongodb";
import { UserState } from "../types";

export interface User {
  email: string;
  username: string;
  password: string;
  wins?: number;
  gamesPlayed?: number;
}

export interface UserDto {
  _id: string;
  email: string;
  username: string;
  wins?: number;
  gamesPlayed?: number;
  gameState: UserState;
}

export function toInGameUserDto(user: WithId<User>) : UserDto {
  return {
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
    wins: user.wins,
    gamesPlayed: user.gamesPlayed,
    gameState: UserState.alive
  };
}
