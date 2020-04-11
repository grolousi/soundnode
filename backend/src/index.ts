import * as express from 'express';
import { fileParser } from 'express-multipart-file-parser';
import * as cors from 'cors';
import { tracksRouter } from './tracks/tracks-routes';

const app: express.Application = express();
app.use(
  cors({
    credentials: true,
    allowedHeaders: ['Content-type', 'Authorization'],
    exposedHeaders: ['Authorization']
  })
);
//app.use(express.json());
app.use('/tracks', tracksRouter());

app.listen(3005, () => {
  console.log('App listening on port 3005!');
});
