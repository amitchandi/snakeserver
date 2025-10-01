import uWS, { WebSocket } from "uWebSockets.js";
import { UserState, UserData, inGameUser } from "../../types";
import { users } from "../users";

import { app } from "../../server";
import { UserDto } from "../../models/User";
import { activeUsers, lobbies } from "../../matchmaking";

const functions: Array<Function> = [];

/**
 * Send 'eatPellet' event to room with the given id
 */
function eatPellet(data: any, ws: WebSocket<UserData>) {
  app.publish(
    "lobby/" + ws.getUserData().lobbyId,
    JSON.stringify({
      event: "eatPellet",
      data: {
        args: data.args,
      },
    }),
  );
}

/**
 * Send 'die' event to room with the given id
 */
function die(data: any, ws: WebSocket<UserData>) {
  const userData = ws.getUserData();
  if (!userData.lobbyId) return;
  if (!userData.userId) return;

  app.publish(
    "lobby/" + ws.getUserData().lobbyId,
    JSON.stringify({
      event: "die",
      data: {
        args: data.args,
      },
    }),
  );

  const lobby = lobbies.get(userData.lobbyId)
  if (!lobby) return;
  if (!lobby.playerObjects) return;

  const player = lobby.playerObjects[userData.userId];
  if (!player) return;

  player.gameState = UserState.dead;

  // check if any other players still alive in room, if not, send win event to room

  let alive: UserDto[] = [];
  for (const [key, user] of Object.entries(lobby.playerObjects)) {
    if (user.gameState == UserState.alive) {
      alive.push(player);
    }
  }

  if (alive.length == 1) {
    winner(
      {
        lobbyId: userData.lobbyId,
        args: {
          userId: alive[0]._id,
          username: alive[0].username,
        },
      },
      ws,
    );
  }
}

/**
 * Send Chat Message to Room
 */
function chatMessage(data: any, ws: WebSocket<UserData>) {
  app.publish(
    "lobby/" + ws.getUserData().lobbyId,
    JSON.stringify({
      event: "chatMessage",
      data: {
        args: data.args,
      },
    }),
  );
}

/**
 * Send Winner Event to Room
 */
function winner(data: any, ws: WebSocket<UserData>) {
  app.publish(
    "lobby/" + ws.getUserData().lobbyId,
    JSON.stringify({
      event: "winner",
      data: {
        args: data.args,
      },
    }),
  );
}

/**
 * Send zoom event to all players except sender
 */
function zoom(data: any, ws: WebSocket<UserData>) {
  app.publish(
    "lobby/" + ws.getUserData().lobbyId,
    JSON.stringify({
      event: "zoom",
      data: {
        args: data.args,
      },
    }),
  );
}

/**
 * Send slow event to sender only -- might delete, doesnt seem necessary
 */
function slow(data: any, ws: WebSocket<UserData>) {
  ws.send(
    JSON.stringify({
      event: "slow",
      data: {
        args: data.args,
      },
    }),
  );
}

/**
 * Send invincible slow event to sender only
 */
function invincible(data: any, ws: WebSocket<UserData>) {
  ws.send(
    JSON.stringify({
      event: "invincible",
      data: {
        args: data.args,
      },
    }),
  );
}

/**
 * Set the Game State of the user with the given userId
 */
async function setGameState(data: any, ws: WebSocket<UserData>) {
  try {
    const userData = ws.getUserData();
    userData.gameState = data.args.gameState;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Get the Game State of the user with the given userId
 */
async function getGameState(data: any, ws: WebSocket<UserData>) {
  let websocket = activeUsers.get(data.args.userId);
  if (!websocket) return;

  const userData = websocket.getUserData() as UserData;
  ws.send(JSON.stringify({
    event: 'getGameState',
    data: {
        userId: userData.userId,
        username: userData.username,
        gameState: userData.gameState,
    }
  }));
}

functions.push(eatPellet);
functions.push(die);
functions.push(chatMessage);
functions.push(winner);
functions.push(zoom);
functions.push(slow);
functions.push(invincible);
functions.push(setGameState);
functions.push(getGameState);

export { functions };
