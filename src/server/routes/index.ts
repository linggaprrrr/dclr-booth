import { Router } from 'express';
import pictureRoutes from '../routes/pictures';

const router = Router();

// Define your API routes here
pictureRoutes(router);

export const apiRoutes = router; 
