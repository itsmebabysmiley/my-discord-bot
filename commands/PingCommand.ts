import { CommandInteraction } from "discord.js";
import { ICommand } from "./ICommand";

export class PingCommandHandler implements ICommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: "Secret Pong!", ephemeral: true });
  }
}
