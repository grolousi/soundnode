import * as express from 'express';
import * as cors from 'cors';
import { tracksRouter } from './tracks/tracks.routes';

const lauchApp = async (): Promise<void> => {
  const app: express.Application = express();
  app.use(
    cors({
      credentials: true,
      allowedHeaders: ['Content-type', 'Authorization'],
      exposedHeaders: ['Authorization']
    })
  );
  //app.use(express.json());
  app.use('/tracks', await tracksRouter());

  app.listen(3005, () => {
    console.log('App listening on port 3005!');
  });
};

lauchApp();
