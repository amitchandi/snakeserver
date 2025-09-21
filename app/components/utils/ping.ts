import { WebSocket } from 'uWebSockets.js';
import { UserData } from '../../types';

/**
 * basic ping. can be used to show connection speed.
 * @param data generic data
 * @param ws websocket
 */
export function ping(data: any, ws: WebSocket<UserData>) {
    ws.send(JSON.stringify({
        event: 'ping',
        data : {
            args: data.args,
        }
    }));
}
