import express, { Request, Response } from 'express';
import next from 'next';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import { apiRoutes } from './routes/index';
import path from 'path'
import fs from 'fs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { uploadPhotoQueue } from './services/queue';
import transactionDetail from './controllers/transactionDetail';

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
  server.use('/uploads/:trxId/:fileName', (req, res) => {
    let trxId = req.params.trxId
    let fileName = req.params.fileName

    let filepath = path.join(process.cwd(), 'uploads', trxId, fileName)

    if (fs.existsSync(filepath)) {
      return res.sendFile(filepath)
    }
    return res.status(404).send('File rangga not found')
  })
  server.use('/uploads/:trxId', express.static(path.join(process.cwd(), 'uploads')))

  // API routes
  server.use('/api', apiRoutes);

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [
      new BullAdapter(uploadPhotoQueue)
    ],
    serverAdapter: serverAdapter,
  });

  server.get('/trx/:trxId', transactionDetail);
  
  server.use('/admin/queues', serverAdapter.getRouter());

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