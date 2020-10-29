export enum UserState {
    alive = 0,
    dead = 1,
}

export type User = {
    id: string;
    deviceId: string;
    name: string;
    isReady: boolean;
    state?: UserState;
}

export type Room = {
    id: string;
    roomName: string;
    isGameRoom: boolean;
    inGame: boolean;
    ownerId: User["id"]; // user id
    users: Array<User>;
    settings: any;
}