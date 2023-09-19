import { ModalBuilder } from "@discordjs/builders";
import { ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

import * as Enum from "../types/enums";

export class ProfileChangingMenuBuilder extends ModalBuilder {
    constructor() {
        super();
        this.setCustomId(
            `J-${Enum.JaneInteractionType.MODAL}-${Enum.JaneInteractionGroup.DATABASE}-${Enum.JaneDatabaseActions.UPDATE}-0` as JaneInteractionId
        );
        this.setTitle("用戶個人資料設定");

        const classInput = new TextInputBuilder()
            .setCustomId("class")
            .setLabel("班別 (2023/2024 年度)")
            .setStyle(TextInputStyle.Short);

        const firstActionRow =
            new ActionRowBuilder<TextInputBuilder>().addComponents(classInput);

        this.addComponents(firstActionRow);
    }
}
