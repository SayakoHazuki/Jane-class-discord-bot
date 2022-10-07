import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "jql-profile",
    command: "jql-profile",
    aliases: [],
    category: "jql",
    description: "查看 jql 個人檔案",
    usage: "jql-profile",
    args: [],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator
) {
    return "";
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
