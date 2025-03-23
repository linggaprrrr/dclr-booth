import express, { Request, Response } from 'express';
import next from 'next';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import { apiRoutes } from './routes/index';
import path from 'path'

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT ?? 3000;

app.prepare().then(() => {
  const server = express();

  // Middleware
  server.use(cors());
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  // API routes
  server.use('/api', apiRoutes);

  // Example API endpoint
  server.get('/api/hello', (req: Request, res: Response) => {
    res.json({ message: 'Hello from Express backend!' });
  });

  // Let Next.js handle all other routes
  server.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
}); 