import { v4 } from 'uuid';
import uWS from 'uWebSockets.js';
import { User } from '../../types';

const functions: Array<Function> = [];

const users: {[key: string]: User} = {
    '123': {
        id: v4(),
        deviceId: '123',
        name: 'Baby Snake',
        isReady: false,
        wins: 0,
    },
    '456': {
        id: v4(),
        deviceId: '456',
        name: 'Mama Snake',
        isReady: false,
        wins: 0,
    }
}; // temporary, will use mongo database

/**
 * Get all online users
 * @returns {[key: string]: User}
 */
function getUsers(): {[key: string]: User} {
    return users;
}

/**
 * Get the user with the given id
 * @param userId id of the user
 * @returns {User}
 */
export function getUser(userId: string): User | undefined {
    for (let deviceId in users) {
        let user = users[deviceId];
        if (user.id === userId) {
            return user;
        }
    }
}

/**
 * Get the user with the given id
 * @param userId id of the user
 * @returns {User}
 */
export function getUserWithDevice(data: {deviceId: string}): User | undefined {
    return users[data.deviceId];
}

/**
 * Update the name of the user with the given deviceId
 * @param data deviceId and new name
 * @returns {boolean}
 */
function updateUsername(data: {deviceId: string, name: string}): boolean {
    var user = users[data.deviceId];
    if (user === undefined) {
        return false;
    } else {
        user.name = data.name;
        users[data.deviceId] = user;
        return true;
    }
}

/**
 * Create the user with the given deviceId
 */
function createUser(data: {deviceId: string, name: string}) {
    let user = {
        id: v4(),
        deviceId: data.deviceId,
        name: data.name,
        isReady: false,
        wins: 0,
    };
    users[data.deviceId] = user;
    return user;
}

/**
 * Add to the win count of the user with the given id
 */
function addWin(data: {userId: string}) {
    let user = getUser(data.userId);
    if (user !== undefined) {
        ++user.wins;
    }
}

functions.push(getUsers);
functions.push(getUser);
functions.push(updateUsername);
functions.push(getUserWithDevice);
functions.push(createUser);
functions.push(addWin);

export {
    functions
}