import { Logger } from './Modules/Logger'
import { initalize } from './Clients/Twitch'
import { query } from './Modules/Database'


(async () => {

  try {
    await query('SELECT 1');
    Logger.info('Successfully connect Database!');

    await initalize()
    Logger.info('Twitch started!')

    Logger.info('Bot started!')
  } catch (error) {
    Logger.error('Failed start bot:', error)
    throw error;
  };

})();