import { Bot } from '../../bot';
import { BotModule } from "../../models/bot-module.model";
import { default as ClearCommandClass } from './commands/clear.command';
import { default as SetActivityCommandClass } from './commands/set-activity.command';
import { Activity, IActivityDocument } from './models/activity.model';

export class AdministrationModule extends BotModule {
  
  protected initCallbacks(): void {
    this.callbacks = new Map();
  }

  protected initCommands(): void {
    this.commands.push(new SetActivityCommandClass(this));
    this.commands.push(new ClearCommandClass(this));
  }

  /**
   * Initializes bot activity
   */
   protected async initModule(): Promise<void> {
    
    Activity.findOne( {} ).then((activity: IActivityDocument) => {
      if(activity && activity.activity) {
        Bot.getClient().user.setActivity(activity.activity, { type: activity.options.type, url: activity.options.url });
      }
    });
  }
}