import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";

const logger: JaneLogger = require("../../core/logger")(__filename);

const commandOptions: CommandOptions = {
    name: "測試",
    command: "test",
    aliases: ["ts"],
    category: "一般",
    description: "testing stuff",
    usage: "test string",
    args: [
        {
            name: "testing_string",
            type: "string",
            description: "an option for testing",
            required: true,
        },
    ],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator,
    arg1: string
) {
    logger.warn(`initiator user id: ${initiator.user?.id}`);
    logger.warn(`initiator content: ${initiator.content}`);
    await initiator.strictReply(
        `Received your message! #${initiator.id} :hushed: @${initiator.user?.id}`
    );
    await initiator.strictReply(
        `Received your message! #${initiator.id} :hushed: @${initiator.user?.id}`
    );
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
