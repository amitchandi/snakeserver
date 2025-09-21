import { app } from './server';
import { closeDb } from './db';

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
