import { startServer } from './server.js';
import { getLogger } from './utils/logger.js';

const logger = getLogger();

async function main(): Promise<void> {
  try {
    await startServer();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
