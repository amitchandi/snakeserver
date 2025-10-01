import uWS, { HttpRequest, HttpResponse } from "uWebSockets.js";
import { readJson } from "./ReadJSON";
import { users } from "../components/";
import { login } from "../auth";
import jwt from "jsonwebtoken";
import { updateUsername } from "../users";

export function AddRoutes(app: uWS.TemplatedApp) {
  app

    // Default route
    .any("/*", (res, req) => {
      res.writeHeader("Access-Control-Allow-Origin", "*");
      res.end("Nothing to see here!");
    })

    //User Management
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
    .put("/updateUsername", (res: HttpResponse, req: HttpRequest) => {
      readJson(
        res,
        async (data: any) => {
          let updated = await updateUsername(
            data.email,
            data.newUsername,
          );

          res.cork(() => {
            if (updated) res.end("true");
            else res.end("false");
          });
        },
        () => {
          /* Request was prematurely aborted or invalid or missing, stop reading */
          console.log("Invalid JSON or no data at all!");
        },
      );
    })

    //Authentication
    .post("/login", (res: HttpResponse, req: HttpRequest) => {
      console.log("login request received");
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
    });
}
