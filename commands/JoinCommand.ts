import { ChannelType, CommandInteraction } from "discord.js";
import { ICommand } from "./ICommand";
import {
  joinVoiceChannel,
  createAudioPlayer,
  NoSubscriberBehavior,
  createAudioResource,
  AudioPlayerStatus,
} from "@discordjs/voice";

export class JoinCommandHandler implements ICommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // Check if the command was used in a guild
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a guild.",
        ephemeral: true,
      });
      return;
    }

    // Check if the user is in a voice channel
    const member = interaction.member;
    if (!member || !("voice" in member) || !member.voice.channelId) {
      await interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        ephemeral: true,
      });
      return;
    }

    // Join the voice channel
    const channel = interaction.guild.channels.resolve(member.voice.channelId);
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.reply({
        content: "Failed to join voice channel.",
        ephemeral: true,
      });
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    await interaction.reply({
      content: `Joined voice channel :: ${channel.name}!`,
      ephemeral: true,
    });

    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause }, // delete the player when there are no subscribers
    });
    const resource = createAudioResource("sounds/hello.mp3", {
      metadata: {
        title: "hello welcome!",
      },
    });
    player.play(resource);
    connection.subscribe(player);

    // Disconnect from the voice channel when the audio ends
    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
  }
}
