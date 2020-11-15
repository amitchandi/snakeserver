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
        let room = rooms.getRoomWithId(data.roomId);
        let index = room.users.findIndex(user => {
            user.id === user.id;
        });
        room.users[index] = user;
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
 * Send zoom event to all players except sender
 */
function zoom(data: any, ws: uWS.WebSocket) {
    ws.publish('rooms/' + data.roomId, JSON.stringify({
        event: 'zoom',
        data : {
            args: data.args,
        }
    }));
}

/**
 * Send slow event to sender only -- might delete, doesnt seem necessary
 */
function slow(data: any, ws: uWS.WebSocket) {
    ws.send(JSON.stringify({
        event: 'slow',
        data : {
            args: data.args,
        }
    }));
}

/**
 * Send invincible slow event to sender only -- might delete, doesnt seem necessary
 */
function invincible(data: any, ws: uWS.WebSocket) {
    ws.send(JSON.stringify({
        event: 'invincible',
        data : {
            args: data.args,
        }
    }));
}

/**
 * Set the Game State of the user with the given userId
 */
function setGameState(data: any, ws: uWS.WebSocket) {
    let user = users.getUser(data.args.userId);
    if (user !== undefined) {
        user.gameState = data.args.gameState;
        console.log(data.args.gameState);
    }
}

/**
 * Get the Game State of the user with the given userId
 */
function getGameState(data: any, ws: uWS.WebSocket) {
    let user = users.getUser(data.args.userId);
    if (user !== undefined) {
        ws.send(JSON.stringify({
            event: 'getGameState',
            data: {
                userId: user.id,
                username: user.name,
                gameState: user.gameState,
            }
        }));
    }
}

functions.push(startGame);
functions.push(setReadyStatus);
functions.push(eatPellet);
functions.push(die);
functions.push(chatMessage);
functions.push(winner);
functions.push(zoom);
functions.push(slow);
functions.push(invincible);
functions.push(setGameState);
functions.push(getGameState);

export {
    functions
}