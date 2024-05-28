import { CommandInteraction, CacheType } from "discord.js";
import { ICommand } from "./ICommand";

export class KickCommandHandler implements ICommand {
  async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
    const member = interaction.member;

    if (!member || !("voice" in member) || !member.voice.channelId) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        ephemeral: true,
      });
      return;
    }
    console.log("kick", member);
    if (!member.kickable) {
      await interaction.reply({
        content: "I cannot kick you.",
        ephemeral: true,
      });
      return;
    }
    await member.kick();
    await interaction.reply({
      content: "You have been kicked.",
      ephemeral: true,
    });
  }
}
