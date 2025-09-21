import { User } from "./models/User";

export enum UserState {
    alive = 0,
    dead = 1,
}

export type inGameUser = {
  userInfo: User;
  gameState: UserState;
  isReady: boolean;
}

export type Room = {
    id: string;
    roomName: string;
    isGameRoom: boolean;
    inGame: boolean;
    ownerId: User["_id"]; // user id
    // users: inGameUser[];
    users: Map<string, inGameUser>;
    settings: any;
}

export type GameState = {
    userId: string;
    tiles: Array<Tile>;
    pellet: number;
    special: number;
    direction: Directions;
    nextDirection: Directions;
    isGameRunning: boolean;
    speed: number;
    elapsedTime: number;
    InSpecial: boolean;
    InZoom: boolean;
    InSlow: boolean;
    InInvincible: boolean;
    CanSpawnSpecial: boolean;
}

export type Tile = {
    position: number;
    tileType: TileType;
    isNew: boolean;
}

// ENUMS
export enum Directions {
    LEFT,
    RIGHT,
    UP,
    DOWN
}

export enum TileType {
    EMPTY = 0,
    SNAKE = 1,
    PELLET = 2,
    WALL = 3,
    SPECIAL = 4,
}

export type UserData = {
    userId?: string;
    deviceId?: string;
    isReady: boolean;
    event?: string;
    data?: object;
}
