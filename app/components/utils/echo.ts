import { WebSocket } from 'uWebSockets.js';
import { UserData } from '../../types';

/**
 * echo a message sent to the server back to sender
 * @param data message
 * @param ws websocket
 */
export function echo(data: any, ws: WebSocket<UserData>) {
    ws.send(JSON.stringify({
        event: 'echo',
        data: data
    }));
}
