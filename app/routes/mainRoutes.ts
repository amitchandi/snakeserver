import uWS, { HttpRequest, HttpResponse } from "uWebSockets.js";
import { readJson } from "./ReadJSON";
import { users } from "../components";
import { login } from "../auth";
import jwt from "jsonwebtoken";
import { updateUsername } from "../users";
import { endResponseJSON, endResponse } from "./helperFunctions";

export function AddMainRoutes(app: uWS.TemplatedApp) {
  app

    // Default route
    .any("/*", (res, req) => {
      endResponse(res, "200", "Nothing to see here!");
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
          });

          res.cork(() => endResponseJSON(res, userRes.status, userRes));
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
            if (updated) endResponse(res, "200", "true");
            else endResponse(res, "200", "false");
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
              endResponse(res, loginRes.status, "");
            } else {
              const token = jwt.sign({ id: loginRes.userId, email: loginRes.email, username: loginRes.username }, process.env.JWT_SECRET!, { expiresIn: "15m" });
              loginRes.token = token;
              endResponseJSON(res, loginRes.status, loginRes);
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
