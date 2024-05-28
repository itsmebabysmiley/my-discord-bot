import { Channel, ChannelType, CommandInteraction } from "discord.js";
import { ICommand } from "./ICommand";
type SendMessageParams = {
  channel: Channel;
  message: string;
};
export class SendMessageCommandHandler implements ICommand {
  async execute({ channel, message }: SendMessageParams): Promise<void> {
    if (channel && channel.type === ChannelType.GuildText) {
      channel.send(message);
    }
  }
}
