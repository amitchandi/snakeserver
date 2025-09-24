import { game } from './game';
import { users } from './users';

// bind functions
const components: {[key: string]: any} = {};

game.functions.forEach(fn => {
    components[fn.name] = fn;
});

users.functions.forEach(fn => {
    components[fn.name] = fn;
});

export {
    components,
    users
}
