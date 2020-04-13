import * as express from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { tracksRouter } from './tracks/tracks.routes';
import { authRouter } from './authentification/auth.routes';
import { infoLogger } from './logger';
import { validateToken } from './middlewares/token.validator';

const lauchApp = async (): Promise<void> => {
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

  app.use('/tracks', validateToken, await tracksRouter());

  app.listen(3005, () => {
    infoLogger('App listening on port 3005!');
  });
};

lauchApp();
