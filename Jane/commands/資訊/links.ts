import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "常用連結",
    command: "links",
    aliases: ["link", "l"],
    category: "資訊",
    description: "查看常用連結",
    usage: "links",
    args: [],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator
) {
    const linkButton = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("請按此把簡加進你的伺服器")
            .setURL(
                "https://discord.com/api/oauth2/authorize?client_id=801354940265922608&permissions=8&scope=bot"
            ),
    ]);
    initiator.strictReply({
        components: [linkButton],
    });
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
