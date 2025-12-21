
import { usePlatform } from '@/layers/platform/usePlatform';
import WebRouter from '@/platforms/web/router';
import TelegramRouter from '@/platforms/telegram/router';

const PlatformRouter = () => {
  const { platform } = usePlatform();
  
  console.log('PlatformRouter: текущая платформа =', platform);
  
  switch(platform) {
    case 'telegram':
      return <TelegramRouter />;
    case 'web':
    default:
      return <WebRouter />;
  }
};

export default PlatformRouter;