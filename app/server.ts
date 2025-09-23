import uWS from "uWebSockets.js";
import { components } from "./components";
import { AddRoutes } from "./routes";
import {
  upgrade,
  subscription,
  drain,
  uWSClose,
  message,
  open,
} from "./websocket";

const maxBackPressure: number = process.env.MAX_BACKPRESSURE! || 1024;

// an "app" is much like Express.js apps with URL routes,
// here we handle WebSocket traffic on the wildcard "/*" route
const app = uWS.App().ws("/*", {
  // handle messages from client
  maxBackpressure: maxBackPressure,
  idleTimeout: 120,
  maxPayloadLength: 64 * 1024, // 64 Mb

  open: open,
  message: message,
  drain: drain,
  close: uWSClose,
  upgrade: upgrade,
  subscription: subscription,
});

AddRoutes(app, components);

export { app };
