import { BotModule } from '../../../models/bot-module.model';
import { Command } from '../../../models/command.model';
import { GameServersModule } from '../game-servers.module';

export default abstract class GameServersBaseCommand extends Command {

  protected game: string;

  public constructor(module: BotModule, game: string) {
    super(module);
    this.game = game;
  }

  protected get gameServersModule(): GameServersModule {
    return this.module as GameServersModule;
  }
}