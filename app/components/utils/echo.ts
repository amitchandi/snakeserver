import uWS from 'uWebSockets.js';

/**
 * echo a message sent to the server back to sender
 * @param data message
 * @param ws websocket
 */
export function echo(data: any, ws: uWS.WebSocket) {
    ws.send(JSON.stringify({
        event: 'echo',
        data: data
    }));
}