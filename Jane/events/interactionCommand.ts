import { Interaction } from "discord.js";
import { EventBuilder } from "../core/eventBuilder";
import { JaneClient } from "../core/client";
import { ChatInputCommandInitiator } from "../core/commandInitiator";
import { initLogger } from "../core/logger";

const Logger = initLogger(__filename);

async function eventCallback(client: JaneClient, interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.user.bot || !interaction.guild) return;

  if (!interaction.deferred) await interaction.deferReply();

  const initiator = new ChatInputCommandInitiator(interaction);

  const args = initiator.content
    .slice(client.prefix.length)
    .trim()
    .split(/ +/g);
  const cmd = args.shift()?.toLowerCase();

  const command =
    client.commands.get(cmd ?? "") ??
    client.commands.find(
      (command) =>
        !!command.options.aliases && command.options.aliases.includes(cmd || "")
    );

  if (!command) return;

  // Logger.info(
  //     `${Util.logColor("cyan.fg")}${message.author.tag}${Util.logColor(
  //         "reset"
  //     )} runned command ${Util.logColor("cyan.fg")}${
  //         command.name
  //     }${Util.logColor("reset")}`
  // );
  // Logger.info(`${Util.logColor("reset")}\tCmd: ${message.content}`);
  // Logger.info(
  //     `${Util.logColor("reset")}Running command ${Util.logColor("cyan.fg")}${
  //         command.name
  //     }`
  // );

  command.callback(client, initiator, ...args).then(
    (replyContent) => {
      if (replyContent !== undefined) initiator.strictReply(replyContent);
    },
    (e: Error) => {
      console.error(e);
      Logger.error(e.stack || "");
      initiator.strictReply("❌ | 執行指令期間發生了一個錯誤");
    }
  );
}

export const event = class InteractionCommandsLoader extends EventBuilder {
  constructor() {
    super("interactionCreate", eventCallback);
  }
};
