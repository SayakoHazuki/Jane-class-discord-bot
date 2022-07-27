import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";

const logger = <typeof Logger>require("../../core/logger")(__filename);

const commandOptions = {
    command: "test",
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator,
    arg1: string
) {
    logger.warn(`initiator user id: ${initiator.user?.id}`);
    logger.warn(`initiator content: ${initiator.content}`);
    initiator.reply(
        `Received your message! #${initiator.id} :hushed: @${initiator.user?.id}`
    );
    initiator.followUp(
        `Received your message! #${initiator.id} :hushed: @${initiator.user?.id}`
    );
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
