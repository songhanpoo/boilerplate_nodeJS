import srv from './core/srv';
import logger from '@src/utils/logger';

const PORT = 3000;
srv.listen(PORT, () => {
  logger.info(`⚡ Express server listening on port ${PORT}`);
})