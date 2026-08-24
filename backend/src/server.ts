import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Last-Mile Delivery Tracker Backend running on port ${PORT} in ${config.env} mode`);
  logger.info(`📡 API endpoint: http://localhost:${PORT}/api`);
});
