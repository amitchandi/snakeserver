import { app } from './server';
import { closeDb, initDb } from './db';
import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

initDb();

// finally listen using the app on port 9001
app.listen(9001, (listenSocket) => {
    if (listenSocket) {
      console.log('Listening to port 9001.');
    }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeDb();
  process.exit(0);
});
