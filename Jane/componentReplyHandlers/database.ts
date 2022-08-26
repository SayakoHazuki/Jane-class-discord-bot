import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { Database } from "../core/classes/database";
import { JaneGeneralError } from "../core/classes/errors";
import { ButtonInitiator } from "../core/commandInitiator";
import * as Enum from "../types/enums";
import { JaneEmbedBuilder } from "../utils/embedBuilder";

export async function handleDatabaseModals(
    client: JaneClient,
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
        const user = await Database.getUser(interaction.user.id);
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
