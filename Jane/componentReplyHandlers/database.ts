import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { Database } from "../core/classes/database";
import { JaneGeneralError } from "../core/classes/errors";
import { JaneClient } from "../core/client";
import { ButtonInitiator } from "../core/commandInitiator";
import { initLogger } from "../core/logger";
import * as Enum from "../types/enums";
import { JaneEmbedBuilder } from "../utils/embedBuilder";
import { ProfileChangingMenuBuilder } from "../utils/profileChangingMenu";

export async function handleDatabaseModals(
    client: JaneClientT,
    interaction: ModalSubmitInteraction,
    k: string,
    v: string
) {
    if (Number(k) === Enum.JaneDatabaseActions.UPDATE) {
        const cls = interaction.fields
            .getTextInputValue("class")
            .toUpperCase()
            .trim();
        if (!/^(?:[1-6][A-D])|(?:3E)$/.test(cls))
            throw new JaneGeneralError(
                "Unexpected class format",
                Enum.ErrorCode.UNEXPECTED_INPUT_FORMAT,
                {
                    displayMessage:
                        "請確認輸入的班別是否正確 (以 級別+班別 的格式, 例如: 1A)",
                }
            );
        await interaction.deferReply({ ephemeral: true });
        let user = await Database.getUser(interaction.user.id).catch((e) => {
            initLogger(__filename).fatal(e);
            return undefined;
        });
        if (!user) {
            user = await Database.insertUser(interaction.user, {
                sClass: cls as ClassId,
            });
        }
        user.commitUpdate("sClass", cls);
        const newUser = await user.pushUpdates();
        await interaction.editReply({
            embeds: [
                new JaneEmbedBuilder(
                    "info",
                    "已更新你的班別",
                    `新的班別: ${newUser.studentClass}`,
                    {}
                ),
            ],
        });
    }
}

export async function handleDatabaseButton(
    client: JaneClientT,
    interaction: ButtonInteraction,
    k: string,
    v: string
) {
    if (Number(k) === Enum.JaneDatabaseActions.CREATE_USER) {
        await interaction.showModal(new ProfileChangingMenuBuilder());
    }
}
