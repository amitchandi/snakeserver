import { v4 } from 'uuid';
import uWS, { HttpRequest, HttpResponse } from 'uWebSockets.js';
import { rooms } from '../components';
import { readJson } from '../components/utils/ReadJSON';
import { User } from '../models/User';


export function AddRoutes(app: uWS.TemplatedApp, components: {[key: string]: any}) {
    app.get('/getToken', (res: HttpResponse, req: HttpRequest) => {
        // record device id, ip address, time of request, send back tokent that will be used to
        // authenticate user, along with creditantials, from this point forward
        let id = v4();
        res.end(id);
    }).get('/getUser/:deviceId', (res: HttpResponse, req: HttpRequest) => {
        // some kind of authentication with token in header

        res.writeHeader('Access-Control-Allow-Origin', '*');

        /*
        let user = customFns['getUser']({
            deviceId: req.getParameter(0),
        });
        */

        let user = components['getUserWithDevice']({
            deviceId: req.getParameter(0),
        });
        if (user)
            res.end(JSON.stringify(user));
        else
            res.end('');
    }).get('/getRooms', (res: HttpResponse, req: HttpRequest) => {
        // some kind of authentication with token in header
        res.writeHeader('Access-Control-Allow-Origin', '*');

        //res.end(JSON.stringify(customFns['getRooms']()));
        res.end(JSON.stringify(components['getRooms']()));
    }).post('/createUser', (res: HttpResponse, req: HttpRequest) => {
        // some kind of authentication with token in header

        res.writeHeader('Access-Control-Allow-Origin', '*');

        readJson(res, (data: any) => {
            let user: User = components['createUser']({
                deviceId: data.deviceId,
                name: data.name,
            });

            res.end(user._id?.toString());
        }, () => {
            /* Request was prematurely aborted or invalid or missing, stop reading */
            console.log('Invalid JSON or no data at all!');
        });
    }).post('/createRoom', (res: HttpResponse, req: HttpRequest) => {
        // some kind of authentication with token in header

        res.writeHeader('Access-Control-Allow-Origin', '*');

        readJson(res, (data: any) => {
            /*
            let id = customFns['createRoom']({
                roomName: data.roomName,
                isGameRoom: data.isGameRoom,
                ownerId: data.ownerId,
            });
            */
            let roomId = components['createRoom']({
                roomName: data.roomName,
                isGameRoom: data.isGameRoom,
                ownerId: data.ownerId,
                settings: data.settings
            });

            res.end(JSON.stringify(rooms.getRoomWithId(roomId)));
        }, () => {
            /* Request was prematurely aborted or invalid or missing, stop reading */
            console.log('Invalid JSON or no data at all!');
        });
    }).put('/updateUsername', (res: HttpResponse, req: HttpRequest) => {
        // some kind of authentication with token in header

        res.writeHeader('Access-Control-Allow-Origin', '*');

        readJson(res, (data: any) => {
            /*
            let updated = customFns['updateUsername']({
                name: data.name,
                deviceId: data.deviceId,
            });
            */
            let updated = components['updateUsername']({
                name: data.name,
                deviceId: data.deviceId,
            });

            if (updated)
                res.end('true');
            else
                res.end('false');
        }, () => {
            /* Request was prematurely aborted or invalid or missing, stop reading */
            console.log('Invalid JSON or no data at all!');
        });
    }).del('/deleteRoom/:roomId', (res: HttpResponse, req: HttpRequest) => {
        // some kind of authentication with token in header

        res.writeHeader('Access-Control-Allow-Origin', '*');

        /*
        customFns['deleteRoom']({
            id: req.getParameter(0),
        });
        */
        components['deleteRoom']({
            id: req.getParameter(0),
        });

        res.end('Room delete. id:\n' + req.getParameter(0));
    }).any('/*', (res, req) => {
        res.writeHeader('Access-Control-Allow-Origin', '*');
        res.end('Nothing to see here!');
    });
}
