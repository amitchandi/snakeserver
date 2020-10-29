import uWS from 'uWebSockets.js';

/**
 * basic ping. can be used to show connection speed.
 * @param data generic data
 * @param ws websocket
 */
export function ping(data: any, ws: uWS.WebSocket) {
    ws.send(JSON.stringify({
        event: 'ping',
        data : {
            args: data.args,
        }
    }));
}