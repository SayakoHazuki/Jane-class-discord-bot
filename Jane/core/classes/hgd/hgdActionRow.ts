import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import * as Database from "../database";
import * as Enum from "../../../types/enums";
import { initLogger } from "../../logger";

const Logger = initLogger(__filename);

export class HgdActionRowBuilder extends ActionRowBuilder<ButtonBuilder> {
    constructor(dbUser: Database.User) {
        super();

        const buttons = [];
        const actionAvailabilities = dbUser.hgdData?.actionAvailabilities ?? [];

        for (const actionAvailability of actionAvailabilities) {
            const actionEmoji =
                actionAvailability.actionConfig.emoji.fullId.includes("<")
                    ? actionAvailability.actionConfig.emoji.fullId
                          .split(":")[2]
                          .replace(/>/g, "")
                    : actionAvailability.actionConfig.emoji.fullId;

            const btn = new ButtonBuilder()
                .setCustomId(
                    `J-${Enum.JaneInteractionType.BUTTON}-${
                        Enum.JaneInteractionGroup.HGD
                    }-${Enum.JaneHgdButtonActions.RUN}-${
                        Enum.JaneHgdButtonRunCode[actionAvailability.action]
                    }`
                )
                .setDisabled(!actionAvailability.available)
                .setEmoji(actionEmoji)
                .setStyle(ButtonStyle.Secondary);
            buttons.push(btn);
        }

        this.addComponents(buttons.slice(0, 5));
    }
}
