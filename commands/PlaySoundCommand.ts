import { Client, ChannelType } from "discord.js";
import fs from "fs";
import { ICommand } from "./ICommand";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";

type PlaySoundParams = {
  channelId: string;
  filePath: string;
  client: Client;
};
export class PlaySoundCommandHandler implements ICommand<PlaySoundParams> {
  async execute({
    channelId,
    filePath,
    client,
  }: PlaySoundParams): Promise<void> {
    const channel = client.channels.cache.get(channelId);

    if (!channel || channel.type !== ChannelType.GuildVoice) {
      console.error(`Channel with ID ${channelId} is not a voice channel.`);
      return;
    }

    const voiceChannel = channel;

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(fs.createReadStream(filePath));

    player.play(resource);

    connection.subscribe(player);

    // Disconnect from the voice channel when the audio ends
    player.on(AudioPlayerStatus.Idle, () => connection.destroy());
  }
}
