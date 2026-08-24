import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

const app = express();

app.use(cors({
  origin: [config.frontendUrl, 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes under /api
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
