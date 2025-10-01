class CustomWebSocket {
  baseAddress;
  token;
  conn;

  constructor(baseAddress, token) {
    this.baseAddress = baseAddress;
    this.token = token;

    // var conn = new WebSocket("ws://" + baseAddress + `?sec-websocket-key=asd&token=${this.token}`);
    // var conn = new WebSocket("ws://" + baseAddress + `?token=${this.token}`);
    this.conn = new WebSocket("ws://" + baseAddress, this.token);
    this.conn.Headers;

    var callbacks = {};

    this.bind = function (event_name, callback) {
      callbacks[event_name] = callbacks[event_name] || [];
      callbacks[event_name].push(callback);
      return this; // chainable
    };

    this.send = function (event_name, event_data) {
      var payload = JSON.stringify({ event: event_name, data: event_data });
      this.conn.send(payload); // <= send JSON data to socket server
      return this;
    };

    this.sendBinary = function (message) {
      var payload = new Blob(message, { type: 'application/octet-stream' });
      // let payload = Buffer.from(message);
      this.conn.send(payload); // <= send binary to socket server
      return this;
    };

    this.conn.onerror = function (evt) {
      console.log("error");
    };

    // dispatch to the right handlers
    this.conn.onmessage = function (evt) {
      var json = JSON.parse(evt.data);
      console.log(evt);
      dispatch(json.event, json.data);
    };

    this.conn.onclose = function (evt) {
      dispatch("close", evt);
    };
    this.conn.onopen = function () {
      dispatch("open", null);
    };

    var dispatch = function (event_name, message) {
      var chain = callbacks[event_name];
      if (typeof chain == "undefined") return; // no callbacks for this event
      for (var i = 0; i < chain.length; i++) {
        chain[i](message);
      }
    };

    var sendHTTPRequest = async function (action, requestOptions) {
      let room = await fetch("http://" + baseAddress + action, requestOptions)
        .then((response) => response.text())
        .catch((error) => console.log("error", error));
      return JSON.parse(room);
    };

    this.getUser = async function (userId) {
      var myHeaders = new Headers();

      var requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      return await sendHTTPRequest("/getUser/" + userId, requestOptions);
    };
  }
}
