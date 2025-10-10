import { HttpResponse } from "uWebSockets.js";

function setCors(res: HttpResponse) {
  res.writeHeader("Access-Control-Allow-Origin", "*");
}

function setStatus(res: HttpResponse, status: string) {
  res.writeStatus(status);
}

function endResponseJSON(res: HttpResponse, status: string, data: any) {
  setStatus(res, status);
  setCors(res);
  res.writeHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function endResponse(res: HttpResponse, status: string, data: string) {
  setStatus(res, status);
  setCors(res);
  res.end(data);
}

export {
  endResponseJSON,
  endResponse
}
