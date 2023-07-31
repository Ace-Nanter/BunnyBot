import { BotModule } from '@BunnyBot/modules/base';
import ClearCommand from './commands/clear.command';
import SetActivityCommand from './commands/set-activity.command';
import { Activity, IActivity } from './models/activity.model';

export class AdministrationModule extends BotModule {
  protected initCallbacks(): void {
    this.callbacks = {};
  }

  protected initCommands(): void {
    this.commands.push(new SetActivityCommand(this.client));
    this.commands.push(new ClearCommand());
  }

  /**
   * Initializes bot activity
   */
  protected async initModule(): Promise<void> {
    Activity.findOne({}).then((activity: IActivity) => {
      if (activity && activity.activity) {
        this.client.user.setActivity(activity.activity, { type: activity.options.type, url: activity.options.url });
      }
    });
  }
}

export default AdministrationModule;
