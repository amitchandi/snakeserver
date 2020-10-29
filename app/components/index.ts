import { game } from './game';
import { users } from './users';
import { rooms } from './rooms';
import { echo } from './utils/echo';
import { ping } from './utils/ping';

// bind functions
const components: {[key: string]: any} = {};

game.functions.forEach(fn => {
    components[fn.name] = fn;
});

users.functions.forEach(fn => {
    components[fn.name] = fn;
});

rooms.functions.forEach(fn => {
    components[fn.name] = fn;
});

components['echo'] = echo;
components['ping'] = ping;

export {
    components,
    rooms,
    users
}