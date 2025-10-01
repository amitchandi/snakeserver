import { HttpResponse, HttpRequest, us_socket_context_t } from 'uWebSockets.js';

export function upgrade(res: HttpResponse, req: HttpRequest, context: us_socket_context_t) {
  console.log("upgrade");
  /* This immediately calls open handler, you must not use res after this call */
  res.upgrade(
    {
      url: req.getUrl() /* First argument is UserData (see WebSocket.getUserData()) */,
      token: req.getHeader("sec-websocket-protocol"),
    },
    /* Spell these correctly */
    req.getHeader("sec-websocket-key"),
    req.getHeader("sec-websocket-protocol"),
    req.getHeader("sec-websocket-extensions"),
    context,
  );
}
