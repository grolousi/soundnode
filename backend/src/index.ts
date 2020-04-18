import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { tracksRouter } from './tracks/tracks.routes';
import { authRouter } from './authentification/auth.routes';
import { infoLogger } from './logger';
import { config } from 'dotenv';
import { artistsRouter } from './artist/artists.routes';

const lauchApp = async (): Promise<void> => {
  config();
  const app: express.Application = express();
  app.use(
    cors({
      credentials: true,
      allowedHeaders: ['Content-type', 'Authorization'],
      exposedHeaders: ['Authorization']
    })
  );
  app.use(helmet());
  app.use((req: express.Request, _, done: express.NextFunction) => {
    infoLogger(`${req.method.toUpperCase()} : ${req.originalUrl}`);
    done();
  });
  app.use(express.json());

  app.use('/auth', await authRouter());
  app.use('/tracks', await tracksRouter());
  app.use('/artists', await artistsRouter());

  const port = process.env.SERVER_PORT || 3005;
  app.listen(port, () => {
    infoLogger(`App listening on port ${port}!`);
  });
};

lauchApp();
