import { CommandInteraction } from "discord.js";

export interface ICommand<T = any> {
  execute(interaction: T): void;
}
