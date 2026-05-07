import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runMigrations } from './models/database';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/', routes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

async function start() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`BeautyVoice API running on port ${PORT}`);
  });
}

start().catch(console.error);
