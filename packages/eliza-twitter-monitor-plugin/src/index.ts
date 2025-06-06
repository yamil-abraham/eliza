//import { IElizaPlugin } from '@elizaos/core'; // Cambiado de ElizaPlugin a IElizaPlugin
import { TwitterMonitorService } from './services/TwitterMonitorService';

export class TwitterNewPostMonitorPlugin {
  public name = 'TwitterNewPostMonitorPlugin';

  public getServices(): any[] {
    return [TwitterMonitorService];
  }

  public getActions(): any[] {
    return [];
  }

  public getProviders(): any[] {
    return [];
  }
}

export default new TwitterNewPostMonitorPlugin();