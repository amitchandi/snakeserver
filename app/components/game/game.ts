import uWS from 'uWebSockets.js';
import { Room, UserState } from '../../types';
import { rooms } from '../rooms';
import { users } from '../users';

const functions: Array<Function> = [];

/**
 * Start the game
 */
function startGame(data: any, ws: uWS.WebSocket) {
    let room = rooms.getRoomWithId(data.roomId);
    if (room.users?.every((user) => {
        return user.isReady;
    })) {
        room.users?.forEach(user => {
            user.state = UserState.alive;
        });
        room.inGame = true;
        ws.publish('rooms/' + data.roomId, JSON.stringify({
            event: 'startGame',
            data: {
                args: data.args,
            }
        }));
    } else {

    }
}

/**
 Broadcast to room the user calling this action is ready
 */
function setReadyStatus(data: any, ws: uWS.WebSocket) {
    let user = users.getUser(data.userId);
    if (user !== undefined) {
        user.isReady = data.args.isReady;
    }
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'setReadyStatus',
        data: {
            room: rooms.getRoomWithId(data.roomId),
            args: data.args
        },
    }));
}

/**
 * Send 'eatPellet' event to room with the given id
 */
function eatPellet(data: any, ws: uWS.WebSocket) {
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'eatPellet',
        data: {
            args: data.args,
        }
    }));
}

/**
 * Send 'die' event to room with the given id
 */
function die(data: any, ws: uWS.WebSocket) {
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'die',
        data: {
            args: data.args,
        }
    }));

    // set the state of the user that sent this to 'dead'
    let room: Room = rooms.getRoomWithId(data.roomId);
    room.users.forEach(user => {
        if (user.id === data.userId) {
            user.state = UserState.dead;
        }
    });

    // check if any other players still alive in room, if not, send win event to room
    let alive = room.users.filter(user => {
        return user.state == UserState.alive
    });
    if (alive.length == 1) {
        winner({
            roomId: data.roomId,
            args: {
                userId: alive[0].id,
                username: alive[0].name,
            }
        }, ws);

        setTimeout(() => {
            reset({
                roomId: data.roomId,
            }, ws);
        }, 2000);
    }
}

/**
 * Send Chat Message to Room
 */
function chatMessage(data: any, ws: uWS.WebSocket) {
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'chatMessage',
        data : {
            args: data.args,
        }
    }));
}

/**
 * Send Winner Event to Room
 */
function winner(data: any, ws: uWS.WebSocket) {
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'winner',
        data : {
            args: data.args,
        }
    }));
}

/**
 * Reset room
 */
function reset(data: any, ws: uWS.WebSocket) {
    let room = rooms.getRoomWithId(data.roomId);
    //room.users.forEach(user => {
    //    user.isReady = false;
    //});
    room.inGame = false;
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'reset',
        data : {}
    }));
}

/**
 * Send zoom event to all players except sender for 10 seconds
 */
function zoom(data: any, ws: uWS.WebSocket) {
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'zoom',
        data : {
            type: 'start',
            args: data.args,
        }
    }));

    setTimeout(() => {
        ws.publish('rooms/' + data.roomId, JSON.stringify({
            event: 'zoom',
            data : {
                type: 'end',
                args: data.args,
            }
        }));
    }, 10 * 1000);
}

functions.push(startGame);
functions.push(setReadyStatus);
functions.push(eatPellet);
functions.push(die);
functions.push(chatMessage);
functions.push(winner);
functions.push(zoom);

export {
    functions
}