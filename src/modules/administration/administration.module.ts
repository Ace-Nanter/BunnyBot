import { BotModule } from "../../models/modules/bot-module.model";
import { clearCommand } from "./clear.command";
import { setActivityCommand } from "./set-activity.command";

export class AdministrationModule extends BotModule {

  constructor(params: any) {
    super(params);

    this.callbacks = new Map();

    this.commands = new Map();

    this.commands.set(setActivityCommand.slashCommand.name, setActivityCommand);
    this.commands.set(clearCommand.slashCommand.name, clearCommand);
  }
}