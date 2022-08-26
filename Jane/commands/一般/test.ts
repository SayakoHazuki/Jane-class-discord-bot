import { Database, User } from "../../core/classes/database";
import { JaneBaseError, JaneGeneralError } from "../../core/classes/errors";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";
import { ErrorCode } from "../../types/enums";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "測試",
    command: "test",
    aliases: ["ts"],
    category: "一般",
    description: "testing stuff",
    usage: "test",
    args: [],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator,
    arg1: string
) {
    const user = await Database.getUser(initiator.user.id);
    await initiator.strictReply(JSON.stringify(user.json, null, 2));
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
