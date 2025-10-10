import { AddMainRoutes } from './mainRoutes';
import { AddDashboardRoutes } from './dashboardRoutes';
import uWS from 'uWebSockets.js';

function AddRoutes(app: uWS.TemplatedApp) {
  AddMainRoutes(app);
  AddDashboardRoutes(app);
}

export {
  AddRoutes
}
