import {
    AutocompleteInteraction,
    ButtonInteraction,
    Interaction,
    InteractionType,
    ModalSubmitInteraction,
} from "discord.js";
import { EventBuilder } from "../core/eventBuilder";
import { JaneClient } from "../core/client";
import { initLogger } from "../core/logger";
import { JaneBaseError, JaneGeneralError } from "../core/classes/errors";
import * as Enum from "../types/enums";
import { ButtonInitiator } from "../core/commandInitiator";
import { handleHgdButton } from "../componentReplyHandlers/hgd";
import {
    handleDatabaseButton,
    handleDatabaseModals,
} from "../componentReplyHandlers/database";
import { handleNormalFollowUp } from "../componentReplyHandlers/normalFollowUpHandler";

const Logger = initLogger(__filename);

async function eventCallback(client: JaneClientT, interaction: Interaction) {
    try {
        if (
            !(
                interaction.isButton() ||
                interaction.isSelectMenu() ||
                interaction.type === InteractionType.ModalSubmit
            )
        )
            return;
        if (interaction.user.bot || !interaction.guild) return;

        if (!/^J-\w*-\w*-\w*-[\w\W]*$/.test(interaction.customId)) return;

        const [full, interactionType, interactionGroup, k, v] = (
            /^J-(\w*)-(\w*)-(\w*)-([\w\W]*)$/.exec(interaction.customId) ?? []
        ).map((i) => (isNaN(Number(i)) ? i : Number(i))) as
            | [
                  string,
                  Enum.JaneInteractionType,
                  Exclude<
                      Enum.JaneInteractionGroup,
                      Enum.JaneInteractionGroup.NORMAL_FOLLOW_UP
                  >,
                  string,
                  string
              ]
            | [
                  string,
                  Enum.JaneInteractionType,
                  Enum.JaneInteractionGroup.NORMAL_FOLLOW_UP,
                  Enum.JaneInteractionNormalFollowUpSubgroups,
                  string
              ];

        if (full === undefined) {
            throw new JaneGeneralError(
                "Unexpected customId format",
                Enum.ErrorCode.UNEXPECTED_INPUT_FORMAT
            );
        }

        if (interactionType === Enum.JaneInteractionType.BUTTON) {
            interaction = interaction as ButtonInteraction;
            if (interactionGroup === Enum.JaneInteractionGroup.HGD) {
                await handleHgdButton(client, interaction, k, v);
            }

            if (interactionGroup === Enum.JaneInteractionGroup.DATABASE) {
                await handleDatabaseButton(client, interaction, k, v);
            }

            if (
                interactionGroup === Enum.JaneInteractionGroup.NORMAL_FOLLOW_UP
            ) {
                Logger.info(
                    "Received JaneInteractionGroup.NORMAL_FOLLOW_UP, Id:",
                    interaction.customId
                );
                await handleNormalFollowUp(
                    client,
                    new ButtonInitiator(interaction),
                    k,
                    v
                );
            }
        }

        if (interactionType === Enum.JaneInteractionType.MODAL) {
            interaction = interaction as ModalSubmitInteraction;
            if (interactionGroup === Enum.JaneInteractionGroup.DATABASE) {
                await handleDatabaseModals(client, interaction, k, v);
            }
        }
    } catch (e) {
        if (
            !(interaction instanceof AutocompleteInteraction) &&
            (e instanceof Error || e instanceof JaneBaseError)
        ) {
            Logger.error(e.stack ?? e);
            if (e instanceof JaneBaseError) {
                const stackLines = Array.from(
                    e.stack?.matchAll(/\d+:\d+/g) ?? [],
                    (m) => `${m[0]}`
                );
                if (!interaction.deferred) {
                    interaction.reply(
                        `❌ | ${
                            e.data?.displayMessage ??
                            "執行指令期間發生了一個錯誤"
                        } (錯誤代碼 ${`${e.code}:${
                            stackLines[0] ?? "1f1e33:0"
                        }`.replace(/:/g, ".")})`
                    );
                } else {
                    interaction.followUp(
                        `❌ | ${
                            e.data?.displayMessage ??
                            "執行指令期間發生了一個錯誤"
                        } (錯誤代碼 ${`${e.code}:${
                            stackLines[0] ?? "1f1e33:0"
                        }`.replace(/:/g, ".")})`
                    );
                }
            } else {
                if (!interaction.deferred) {
                    interaction.reply("❌ | 執行指令期間發生了一個未知的錯誤");
                } else {
                    interaction.followUp(
                        "❌ | 執行指令期間發生了一個未知的錯誤"
                    );
                }
            }
        }
    }
}

export const event = class componentsInteractionHandler extends EventBuilder {
    constructor() {
        super("interactionCreate", eventCallback);
    }
};
