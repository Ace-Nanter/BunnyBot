import { Command } from '../../../models/command.model';
import { MinecraftModule } from '../minecraft.module';

export default abstract class MinecraftBaseCommand extends Command {
  protected get minecraftModule(): MinecraftModule {
    return this.module as MinecraftModule;
  }
}