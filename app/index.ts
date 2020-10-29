import { app } from './server';

// finally listen using the app on port 9001
app.listen(9001, (listenSocket) => {
    if (listenSocket) {
      console.log('Listening to port 9001.');
    }
});