import uWS from 'uWebSockets.js';
import { v4 } from 'uuid';

import { Room } from '../../types';
import { users } from '../users';

const functions: Array<Function> = [];

const rooms: {[key: string]: Room} = {};

/**
 * Get available rooms
 */
export function getRooms(data: any, ws: uWS.WebSocket | undefined) {
    //if (data?.parameters?.isGameRoom)
    //    console.log();
    
    if (ws !== undefined) {
        ws.send(JSON.stringify({
            event: 'getRooms',
            data: rooms
        }));
    } else {
        return rooms;
    }
}

/**
 * Get room with given room id
 * @param roomId room id
 * @returns {Room} room
 */
export function getRoomWithId(roomId: string): Room {
    return rooms[roomId];
}

/**
 * Get room with given id
 */
export function getRoom(data: any, ws: uWS.WebSocket) {
    if (ws !== undefined) {
        ws.send(JSON.stringify({
            event: 'getRoom',
            data: {
                args: {
                    rooms: rooms[data.roomId]
                }
            }
        }));
    } else {
        return rooms[data.roomId];
    }
}

/**
 * Create a room
 */
export function createRoom(data: any) {
    let id = v4();
    console.log(data);
    rooms[id] = {
        id: id,
        roomName: data.roomName,
        isGameRoom: data.isGameRoom,
        inGame: false,
        ownerId: data.ownerId,
        users: [],
        settings: data.settings,
    };
    return id;
}

/**
 * Delete room with given id
 */
export function deleteRoom(data: {roomId: string}, ws: uWS.WebSocket) {
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'deleteRoom',
        data: {}
    }));
    delete rooms[data.roomId];
}

/**
 * Join the room with the given roomId
 */
export function joinRoom(data: {roomId: string, userId: string}, ws: uWS.WebSocket) {
    var room = rooms[data.roomId];
    if (room.users.findIndex(user => {return user.id === data.userId}) === -1) {
        ws.subscribe('rooms/' + room.id);
        let user = users.getUser(data.userId);
        if (user !== undefined) {
            room.users?.push(user); // need to use db to get user
            ws.publish('rooms/' + room.id, JSON.stringify({
                event: 'joinRoom',
                data: {
                    user: user,
                    room: room
                }
            }));
        }
    }
}

/**
 * Leave the room with the given roomId
 */
export function leaveRoom(data: {roomId: string, userId: string}, ws: uWS.WebSocket) {
    let room = rooms[data.roomId];
    
    if (room !== undefined) {
        let user = users.getUser(data.userId);
        if (user !== undefined) {
            let i = room.users?.indexOf(user);
            if (i !== undefined)
                console.log(room.users?.splice(i, 1)); // need to use db to get user

            if (room.users.length === 0 || room.ownerId === user.id) {
                deleteRoom({roomId: room.id}, ws);
                console.log('deleted');
            } else if (room.users.length > 0) {
                ws.publish('rooms/' + room.id, JSON.stringify({
                    event: 'leaveRoom',
                    data: {
                        userId: user.id,
                        username: user.name,
                        room: room
                    }
                }));
            }
        }
    }
    
    ws.unsubscribe('rooms/' + room.id);
    ws.send(JSON.stringify({
        event: 'leaveRoom',
        data: {
            userId: data.userId,
            room: room
        }
    }));
}

functions.push(getRoom);
functions.push(getRooms);
functions.push(getRoomWithId);
functions.push(createRoom);
functions.push(deleteRoom);
functions.push(joinRoom);
functions.push(leaveRoom);

export {
    functions
}