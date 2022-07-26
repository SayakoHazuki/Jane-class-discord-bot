import { CommandInteraction, Message } from "discord.js";
import { JaneClient } from "../../core/client";
import CommandBuilder from "../../core/commandBuilder";

const logger = <typeof Logger>require("../../core/logger")(__filename);

const commandOptions = {
    command: "test",
};

async function commandCallback(
    client: JaneClient,
    initiator: Message | CommandInteraction,
    arg1: string
) {
    logger.warn("hi", client?.user?.id);
    initiator.channel?.send("!");
    return `Hewwo, ${arg1}`;
}

export default class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
}
