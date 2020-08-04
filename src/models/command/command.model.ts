import { CommandContext } from "./command-context.model";
import { Permission } from "./permission.enum";

export class Command {

  name: string;
  permission: Permission;
  fn: (command: CommandContext) => void;
  
  constructor(name: string, permission: Permission, fn: (command: CommandContext) => void) {
    this.name = name;
    this.permission = permission;
    this.fn = fn;
  }
}