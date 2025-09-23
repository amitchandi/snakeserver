import { v4 } from "uuid";
import uWS, { HttpRequest, HttpResponse } from "uWebSockets.js";
import { readJson } from "../components/utils/ReadJSON";
import { users } from "../components/";
import { login } from "../auth";
import jwt from "jsonwebtoken";

export function AddRoutes(
  app: uWS.TemplatedApp,
  components: { [key: string]: any },
) {
  app
    // .get("/getToken", (res: HttpResponse, req: HttpRequest) => {
    //   // record device id, ip address, time of request, send back tokent that will be used to
    //   // authenticate user, along with creditantials, from this point forward
    //   const token = jwt.sign()
    //   res.end(id);
    // })
    // .get("/getUser/:deviceId", (res: HttpResponse, req: HttpRequest) => {
    //   let user = components["getUserWithDevice"]({
    //     deviceId: req.getParameter(0),
    //   });
    //   if (user) res.end(JSON.stringify(user));
    //   else res.end("");
    // })
    // .get("/getRooms", (res: HttpResponse, req: HttpRequest) => {
    //   //res.end(JSON.stringify(customFns['getRooms']()));
    //   res.end(JSON.stringify(components["getRooms"]()));
    // })
    .post("/createUser", (res: HttpResponse, req: HttpRequest) => {
      readJson(
        res,
        async (data: any) => {

          let userRes = await users.createUser({
            email: data.email,
            username: data.username,
            password: data.password,
          })
          res.cork(() => {
            res.writeStatus(userRes.status)
              .writeHeader("Content-Type", "application/json")
              .writeHeader("Access-Control-Allow-Origin", "*")
              .end(JSON.stringify(userRes));
          });
        },
        () => {
          /* Request was prematurely aborted or invalid or missing, stop reading */
          console.log("Invalid JSON or no data at all!");
        },
      );
    })
    .post("/login", (res: HttpResponse, req: HttpRequest) => {

      readJson(
        res,
        async (data: any) => {
          let loginRes = await login({
            email: data.email,
            password: data.password,
          })

          res.cork(() => {
            if (!loginRes.valid) {
              res.writeStatus(loginRes.status)
                .writeHeader("Access-Control-Allow-Origin", "*")
                .end();
            } else {
              const token = jwt.sign({ id: loginRes.userId, email: loginRes.email, username: loginRes.username }, process.env.JWT_SECRET!, { expiresIn: "15m" });
              loginRes.token = token;
              res.writeStatus(loginRes.status)
                .writeHeader("Content-Type", "application/json")
                .writeHeader("Access-Control-Allow-Origin", "*")
                .end(JSON.stringify(loginRes));
            }
          });
        },
        () => {
          /* Request was prematurely aborted or invalid or missing, stop reading */
          console.log("Invalid JSON or no data at all!");
        },
      );
    })
    // .post("/createRoom", (res: HttpResponse, req: HttpRequest) => {
    //   readJson(
    //     res,
    //     (data: any) => {
    //       let roomId = components["createRoom"]({
    //         roomName: data.roomName,
    //         isGameRoom: data.isGameRoom,
    //         ownerId: data.ownerId,
    //         settings: data.settings,
    //       });

    //       res.end(JSON.stringify(rooms.getRoomWithId(roomId)));
    //     },
    //     () => {
    //       /* Request was prematurely aborted or invalid or missing, stop reading */
    //       console.log("Invalid JSON or no data at all!");
    //     },
    //   );
    // })
    .put("/updateUsername", (res: HttpResponse, req: HttpRequest) => {
      readJson(
        res,
        (data: any) => {
          let updated = components["updateUsername"]({
            name: data.name,
            deviceId: data.deviceId,
          });

          if (updated) res.end("true");
          else res.end("false");
        },
        () => {
          /* Request was prematurely aborted or invalid or missing, stop reading */
          console.log("Invalid JSON or no data at all!");
        },
      );
    })
    // .del("/deleteRoom/:roomId", (res: HttpResponse, req: HttpRequest) => {
    //   components["deleteRoom"]({
    //     id: req.getParameter(0),
    //   });

    //   res.end("Room delete. id:\n" + req.getParameter(0));
    // })
    .any("/*", (res, req) => {
      res.writeHeader("Access-Control-Allow-Origin", "*");
      res.end("Nothing to see here!");
    });
}
