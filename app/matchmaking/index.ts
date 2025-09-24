import { Lobby } from "./Lobby";
import { v4 } from "uuid";
import { app } from "../server";
import { WebSocket } from "uWebSockets.js";
import { UserData } from "../types";

// Map of userId → WebSocket
const activeUsers: Map<string, WebSocket<unknown>> = new Map();
// Queue of waiting players
const queue: string[] = [];
const lobbies: Map<string, Lobby> = new Map();

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const QUEUE_TIMEOUT : number = 5 * 1000;

let queueTimer: NodeJS.Timeout | null = null;

function addToQueue(userId: string) {
  if (!queue.find(id => id === userId)) {
    queue.push(userId);
    console.log(userId, " - joined the queue");

    // If we now have enough players, maybe start the timer
    if (queue.length >= MIN_PLAYERS && !queueTimer) {
      startQueueTimer();
    }

    // If we already hit max, start immediately
    if (queue.length >= MAX_PLAYERS) {
      createLobby();
    }
  }
}

function startQueueTimer() {
  console.log(`Queue timer started (${QUEUE_TIMEOUT}ms)...`);
    queueTimer = setTimeout(() => {
      createLobby();
    }, QUEUE_TIMEOUT);
}

function createLobby() {
  if (queueTimer) {
    clearTimeout(queueTimer);
    queueTimer = null;
  }

  if (queue.length < MIN_PLAYERS) return; // sanity check

  // Take up to MAX_PLAYERS from queue
  const players = queue.splice(0, Math.min(queue.length, MAX_PLAYERS));

  // Generate a unique ID for the lobby
  const lobbyId = v4();
  const lobby: Lobby = {
    id: lobbyId,
    players,
    countdown: setTimeout(() => lobbyTimerFN(lobby), 5 * 1000),
  };
  lobbies.set(lobbyId, lobby);

  players.forEach(p => {
    const ws = activeUsers.get(p);
    if (!ws) return;
    ws.subscribe("lobby/" + lobbyId);
    (ws.getUserData() as UserData).lobbyId = lobbyId;
    ws.send(JSON.stringify({
      event: "lobbyJoined",
      data: {
        lobbyId: lobby.id
      }
    }));
  });

  publishLobbyPlayers(lobby);

  console.log(new Date() + `: Lobby ${lobbyId} created.`);
}

function publishLobbyPlayers(lobby: Lobby) {
  const players: string[] = [];
  lobby.players.forEach(p => {
    const ws = activeUsers.get(p);
    if (!ws) return;
    const userData = ws.getUserData() as UserData;
    players.push(userData.username);
  });

  app.publish("lobby/" + lobby.id, JSON.stringify({
    event: "lobbyPlayers",
    data: {
      players
    }
  }));
}

function lobbyTimerFN(lobby: Lobby) {
  console.log(new Date() + `: Lobby ${lobby.id} timeout finished`);

  app.publish("lobby/" + lobby.id, JSON.stringify({
    event: "startGame",
    data: {},
  }));
}

export {
  activeUsers,
  queue,
  lobbies,
  lobbyTimerFN,
  createLobby,
  publishLobbyPlayers,
  addToQueue
}
