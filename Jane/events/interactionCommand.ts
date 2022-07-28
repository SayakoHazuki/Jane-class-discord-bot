import { Interaction } from "discord.js";
import { EventBuilder } from "../core/eventBuilder";
import { JaneClient } from "../core/client";
import { InteractionCommandInitiator } from "../core/commandInitiator";

const logger: JaneLogger = require("../core/logger")(__filename);

async function eventCallback(client: JaneClient, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.user.bot || !interaction.guild) return;

    if (!interaction.deferred) await interaction.deferReply();

    const initiator = new InteractionCommandInitiator(interaction);

    const args = initiator.content
        .slice(client.prefix.length)
        .trim()
        .split(/ +/g);
    const cmd = args.shift()?.toLowerCase();

    const command =
        client.commands.get(cmd ?? "") ??
        client.commands.find(
            (command) =>
                !!command.options.aliases &&
                command.options.aliases.includes(cmd || "")
        );

    if (!command) return;

    // logger.info(
    //     `${Util.logColor("cyan.fg")}${message.author.tag}${Util.logColor(
    //         "reset"
    //     )} runned command ${Util.logColor("cyan.fg")}${
    //         command.name
    //     }${Util.logColor("reset")}`
    // );
    // logger.info(`${Util.logColor("reset")}\tCmd: ${message.content}`);
    // logger.info(
    //     `${Util.logColor("reset")}Running command ${Util.logColor("cyan.fg")}${
    //         command.name
    //     }`
    // );

    command.callback(client, initiator, ...args).then(
        (replyContent) => {
            if (replyContent !== undefined) initiator.strictReply(replyContent);
        },
        (e: Error) => {
            logger.error(e.stack || "");
            initiator.strictReply("❌ | 執行指令期間發生了一個錯誤");
        }
    );
}

export const event = class InteractionCommandsLoader extends EventBuilder {
    constructor() {
        super("interactionCreate", eventCallback);
    }
};
