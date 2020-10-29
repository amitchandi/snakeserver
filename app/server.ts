// Imports
import uWS from 'uWebSockets.js';

// uWebSockets.js is binary by default
import { StringDecoder } from 'string_decoder';

import { Room } from './types';

import { components, rooms, users } from './components';

import { AddRoutes } from './routes';
// Imports

const decoder = new StringDecoder('utf8');

const maxBackPressure = 1024;
// an "app" is much like Express.js apps with URL routes,
// here we handle WebSocket traffic on the wildcard "/*" route
const app = uWS.App().ws('/*', {  // handle messages from client
    maxBackpressure: maxBackPressure,
    idleTimeout: 120,
    open: (ws, req) => {
        
        // Authenticate with request headers
        ws.send(JSON.stringify({
            event: 'echo',
            data: {
                msg: 'Hello'
            }
        }));
        //console.info(socket);
        //console.log(req);
    },
    message: (ws, message, isBinary) => {

        if (!isBinary) {
            let json = JSON.parse(decoder.write(Buffer.from(message)));
            console.log(json);

            try {
                if (ws.getBufferedAmount() < maxBackPressure)
                    //customFns[json.event](json.data, ws);
                    components[json.event](json.data, ws);
                else {
                    ws['event'] = json.event;
                    ws['data'] = json.data;
                }
            } catch (e) {
                console.log(e);
            }
        }
        else {
            console.log("binary");
        }
    },
    drain: (ws) => {
        console.log('WebSocket backpressure: ' + ws.getBufferedAmount());
        if (ws.getBufferedAmount() < maxBackPressure) {
            //customFns[ws['event']](ws['data'], ws);
            components[ws['event']](ws['data'], ws);
            ws['event'] = undefined;
            ws['data'] = undefined;
        }
    },
    close: (ws, code, message) => {
      /* The library guarantees proper unsubscription at close */
      console.log(code);
      if (code === 1000 || code === 1001 || code === 1006) {
          if (ws["userId"] !== null && ws["deviceId"] !== null) {
            let user = users.getUser(ws["userId"]);
            if (user !== undefined) {
                let _rooms: {[key: string]: Room} | undefined = rooms.getRooms(null, undefined);
                for (let roomId in _rooms) {
                    let room = _rooms[roomId];
                    if (room.users.includes(user)) {
                        console.log(ws["userId"] + ' delete from ' + roomId);
                        let index = room.users.indexOf(user);
                        console.log(index);
                        room.users.splice(index, 1);
                        console.log(room.users);
                    }
                }
            }
            //delete users[json.deviceId];
          }
      }
    }
});

AddRoutes(app, components);

export {
    app
}
