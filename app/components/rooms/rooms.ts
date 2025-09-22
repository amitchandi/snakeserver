import uWS, { WebSocket } from "uWebSockets.js";
import { v4 } from "uuid";

import { Room, UserData } from "../../types";
import { users } from "../users";

import { app } from "../../server";
import { toInGameUserDto } from "../../models/User";

const functions: Array<Function> = [];

const rooms: Map<string, Room> = new Map();

/**
 * Get available rooms
 */
export function getRooms(data: any, ws: WebSocket<UserData> | undefined) {
  if (ws !== undefined) {
    ws.send(
      JSON.stringify({
        event: "getRooms",
        data: rooms,
      }),
    );
  }
  return rooms;
}

/**
 * Get room with given room id
 * @param roomId room id
 */
export function getRoomWithId(roomId: string) {
  return rooms.get(roomId);
}

/**
 * Get room with given id
 */
export function getRoom(data: any, ws: WebSocket<UserData>) {
  if (ws !== undefined) {
    ws.send(
      JSON.stringify({
        event: "getRoom",
        data: {
          room: rooms.get(data.roomId),
        },
      }),
    );
  } else {
    return rooms.get(data.roomId);
  }
}

/**
 * Create a room
 */
export function createRoom(data: any) {
  let id = v4();
  console.log(data);
  rooms.set(id,{
    id: id,
    roomName: data.roomName,
    isGameRoom: data.isGameRoom,
    inGame: false,
    ownerId: data.ownerId,
    users: new Map(),
    settings: data.settings,
  });
  return id;
}

/**
 * Delete room with given id
 */
export function deleteRoom(data: { roomId: string }, ws: WebSocket<UserData>) {
  app.publish(
    "rooms/" + data.roomId,
    JSON.stringify({
      event: "deleteRoom",
      data: {},
    }),
  );
  rooms.delete(data.roomId);
}

/**
 * Join the room with the given roomId
 */
export async function joinRoom(
  data: { roomId: string; userId: string },
  ws: WebSocket<UserData>,
) {
  var room = rooms.get(data.roomId);
  if (!room) return;
  // room.users.findIndex((user) => {return user._id?.toString() == data.userId;}) === -1
  if (room.users.has(data.userId)) {
    ws.subscribe("rooms/" + room.id);
    let user = await users.getUserById(data.userId);
    if (!user) return;
    if (user !== undefined) {
      // user.isReady = false;
      ws.getUserData().isReady = false;
      room.users.set(user._id.toString(), toInGameUserDto(user));
      app.publish(
        "rooms/" + room.id,
        JSON.stringify({
          event: "joinRoom",
          data: {
            user: user,
            room: room,
          },
        }),
      );
    }
  }
}

/**
 * Leave the room with the given roomId
 */
export async function leaveRoom(
  data: { roomId: string; userId: string },
  ws: WebSocket<UserData>,
) {
  let room = rooms.get(data.roomId);

  if (room !== undefined) {
    const res = await users.getUserById(data.userId);
    if (!res) return;
    let user = toInGameUserDto(res);
    if (!user) return;
    if (user !== undefined) {
      // user.isReady = false;
      ws.getUserData().isReady = false;
      // let i = room.users?.indexOf(user);
      // if (i !== undefined) console.log(room.users?.splice(i, 1)); // need to use db to get user

      if (room.users.has(user._id.toString())) room.users.delete(user._id.toString());

      if (room.users.size === 0 || room.ownerId === user._id) {
        deleteRoom({ roomId: room.id }, ws);
        console.log("deleted");
      } else if (room.users.size > 0) {
        app.publish(
          "rooms/" + room.id,
          JSON.stringify({
            event: "leaveRoom",
            data: {
              userId: user._id,
              username: user.username,
              room: room,
            },
          }),
        );
      }
    }
  }

  ws.unsubscribe("rooms/" + data.roomId);
  ws.send(
    JSON.stringify({
      event: "leaveRoom",
      data: {
        userId: data.userId,
        room: room,
      },
    }),
  );
}

functions.push(getRoom);
functions.push(getRooms);
functions.push(getRoomWithId);
functions.push(createRoom);
functions.push(deleteRoom);
functions.push(joinRoom);
functions.push(leaveRoom);

export { functions };
