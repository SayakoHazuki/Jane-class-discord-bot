import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "color",
    command: "color",
    aliases: ["colour"],
    category: "工具",
    description: "Change nickname display color",
    usage: "color",
    args: [
        {
            name: "color",
            type: "string",
            description: "The target color",
            required: false,
        },
        
    ],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator,
    arg1: string
) {
    
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};