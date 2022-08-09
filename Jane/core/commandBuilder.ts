import { JaneClient } from "./client";

import {
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "discord.js";

const commandOptionBuilders = {
    boolean: SlashCommandBooleanOption,
    channel: SlashCommandChannelOption,
    integer: SlashCommandIntegerOption,
    mentionable: SlashCommandMentionableOption,
    number: SlashCommandNumberOption,
    role: SlashCommandRoleOption,
    string: SlashCommandStringOption,
    user: SlashCommandUserOption,
};

export class CommandBuilder {
    options: CommandOptions;
    callback: CommandCallback;

    constructor(ops: CommandOptions, callback: CommandCallback) {
        this.options = {
            name: ops.name || ops.command,
            command: ops.command,
            aliases: ops.aliases || [],
            category: ops.category || "",
            description: ops.description || ops.command,
            usage: ops.usage || ops.command,
            cooldown: ops.cooldown ?? 0,
            minArgs: ops.minArgs ?? 0,
            maxArgs: ops.maxArgs ?? -1,
            devOnly: ops.devOnly ?? false,
            authorPermission: ops.authorPermission,
            clientPermission: ops.clientPermission,
            messageOnly: ops.messageOnly ?? false,
            slashOnly: ops.slashOnly ?? false,
            args: ops.args,
        };
        this.callback = callback;
    }

    get client() {
        return JaneClient.getClient() as JaneClient;
    }

    get slashCommandData() {
        const slashCommand = new SlashCommandBuilder()
            .setName(this.options.command)
            .setDescription(this.options.description || "");
        for (const arg of this.options.args ?? []) {
            const addOptionFunctionName = `add${arg.type
                .charAt(0)
                .toUpperCase()}${arg.type.slice(1)}Option` as
                | "addAttachmentOption"
                | "addBooleanOption"
                | "addChannelOption"
                | "addIntegerOption"
                | "addMentionableOption"
                | "addNumberOption"
                | "addRoleOption"
                | "addStringOption"
                | "addUserOption";
            slashCommand[addOptionFunctionName](
                // @ts-ignore
                new commandOptionBuilders[arg.type]()
                    .setName(arg.name)
                    .setDescription(arg.description)
            );
        }
        return slashCommand.toJSON();
    }
}
