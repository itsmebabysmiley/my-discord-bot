import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  ChannelType,
  Events,
  REST,
  Routes,
} from "discord.js";

import { PingCommandHandler } from "./commands/PingCommand";
import { JoinCommandHandler } from "./commands/JoinCommand";
import { CommandTypes } from "./commands";
import { KickCommandHandler } from "./commands/KickCommand";
import { CronJob } from "cron";
import dayjs from "dayjs";
import { PlaySoundCommandHandler } from "./commands/PlaySoundCommand";
import { SendMessageCommandHandler } from "./commands/SendMessageCommand";

dayjs.extend(require("dayjs/plugin/timezone"));

console.log("Starting bot...");
console.log("Token: ", process.env.DISCORD_TOKEN);
const token = process.env.DISCORD_TOKEN ?? "";

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

const findMostPopulatedVoiceChannel = (
  serverId: string
): string | undefined => {
  const guild = client.guilds.cache.get(serverId);
  if (!guild) {
    console.log("Guild not found");
    return undefined;
  }

  let maxMembersOnChannel = "";
  let maxMembers = 0;

  guild.channels.cache.forEach((channel) => {
    if (channel.type === ChannelType.GuildVoice) {
      const voiceChannel = channel;
      if (voiceChannel.members.size > maxMembers) {
        console.log(
          `Voice channel ${voiceChannel.id} has ${voiceChannel.members.size} member(s).`
        );
        maxMembersOnChannel = voiceChannel.id;
        maxMembers = voiceChannel.members.size;
      }
    }
  });
  return maxMembersOnChannel ?? undefined;
};

const addNewCommand = async (serverId: string) => {
  const commands = [
    {
      name: CommandTypes.PING,
      description: "Replies with Pong!",
    },
    {
      name: CommandTypes.JOIN,
      description: "Joins your voice channel ",
    },
    {
      name: CommandTypes.KICK,
      description: "Kicks a user from the voice channel",
    },
  ];

  const rest = new REST({ version: "9" }).setToken(token);

  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(client.user?.id!, serverId),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};

client.on("ready", async () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
  // let maxMembersOnChannel = "";
  // let maxMembers = 0;
  // client.channels.cache.forEach((channel) => {
  //   if (channel.type === ChannelType.GuildVoice) {
  //     const voiceChannel = channel;
  //     if (voiceChannel.members.size > maxMembers) {
  //       console.log(
  //         `Voice channel ${voiceChannel.id} has ${voiceChannel.members.size} member(s).`
  //       );
  //       maxMembersOnChannel = voiceChannel.id;
  //       maxMembers = voiceChannel.members.size;
  //     }
  //   }
  // });
  // if (maxMembersOnChannel) {
  //   const channel = client.channels.cache.get(maxMembersOnChannel);

  //   if (!channel) {
  //     console.error(`Channel with ID ${maxMembersOnChannel} not found.`);
  //     return;
  //   }

  //   if (!(channel instanceof VoiceChannel)) {
  //     console.error(
  //       `Channel with ID ${maxMembersOnChannel} is not a voice channel.`
  //     );
  //     return;
  //   }
  //   console.log(channel.joinable);
  //   const toAdded = client.guilds.cache.map((guild) => {
  //     return addNewCommand(guild.id);
  //   });
  //   Promise.all(toAdded);
  // }
  const job = CronJob.from({
    cronTime: "55 59 11,17 * * 1-5",
    onTick: () => {
      // run every weekday at 12:00 and 18:00
      const currentHour = dayjs().hour();
      const soundFile = currentHour === 12 ? "noon.mp3" : "evening.mp3";
      const serverId = "1127912851227545600";
      const channelId = findMostPopulatedVoiceChannel(serverId);
      if (!channelId) return;
      const guild = client.guilds.cache.get(serverId);
      if (!guild) return;
      new PlaySoundCommandHandler().execute({
        channelId,
        filePath: `./sounds/${soundFile}`,
        client,
      });
      const generalChannel = guild.channels.cache.find(
        (channel) => channel.name === "general"
      );
      if (!generalChannel) return;
      const channel = client.channels.cache.get(generalChannel?.id);
      if (!channel) return;
      new SendMessageCommandHandler().execute({
        channel,
        message: `It's ${currentHour === 12 ? "noon" : "evening"}!`,
      });
    },
    start: false,
    timeZone: "Asia/Bangkok",
  });
  job.start();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case CommandTypes.PING:
      await new PingCommandHandler().execute(interaction);
      break;
    case CommandTypes.JOIN:
      await new JoinCommandHandler().execute(interaction);
      break;
    case CommandTypes.KICK:
      await new KickCommandHandler().execute(interaction);
      break;
    default:
      await interaction.reply({ content: "Unknown command", ephemeral: true });
      break;
  }
});

client.login(token);
