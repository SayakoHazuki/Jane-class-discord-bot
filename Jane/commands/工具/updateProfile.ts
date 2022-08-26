import { ChatInputCommandInteraction } from "discord.js";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";
import { ProfileChangingMenuBuilder } from "../../utils/profileChangingMenu";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "更新用戶資料",
    command: "更新用戶資料",
    aliases: [],
    category: "工具",
    description: "Update user profile",
    usage: "updateProfile",
    args: [],
    slashOnly: true,
    initialDefer: false
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator<ChatInputCommandInteraction>,
    arg1: string
) {
    const interaction = initiator.initiator;
    await interaction.showModal(new ProfileChangingMenuBuilder());
}

export const command = class TestCommand extends CommandBuilder<ChatInputCommandInteraction> {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
