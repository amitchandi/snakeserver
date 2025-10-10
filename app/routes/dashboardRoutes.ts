import uWS, { HttpRequest, HttpResponse } from "uWebSockets.js";
import { readJson } from "./ReadJSON";
import { activeUsers, lobbies } from "../matchmaking";
import { UserData } from "../types";
import { Lobby } from '../matchmaking/Lobby';
import { endResponseJSON, endResponse } from "./helperFunctions";

export function AddDashboardRoutes(app: uWS.TemplatedApp) {

  app.get("/activeUsers", async (res: HttpResponse, req: HttpRequest) => {
    const activeUsersData: any[] = [];
    for (const [id, ws] of activeUsers.entries()) {
      const userData = (await ws.getUserData()) as UserData;
      activeUsersData.push({
        username: userData.username,
        lobbyId: userData.lobbyId,
      });
    }
    res.cork(() => endResponseJSON(res, "200", activeUsersData));
  });

  app.get("/lobbies", async (res: HttpResponse, req: HttpRequest) => {
    const lobbiesRes: Lobby[] = [];
    for (const [lobbyId, lobby] of lobbies) {
      lobbiesRes.push(lobby);
    }
    res.cork(() => endResponseJSON(res, "200", lobbiesRes));
  });

  app.del("/lobby/:id", async (res: HttpResponse, req: HttpRequest) => {
    const lobbyId = req.getParameter("id");
    if (!lobbyId) {
      endResponse(res, "400", "Missing lobby ID");
      return;
    }

    const lobby = lobbies.get(lobbyId);
    if (!lobby) {
      endResponse(res, "404", "Lobby not found");
      return;
    }

    lobbies.delete(lobbyId);
    endResponse(res, "200", "Lobby deleted");
  });
}
