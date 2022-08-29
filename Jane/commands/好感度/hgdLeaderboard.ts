import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import {
    ReplyMessageOptions,
    InteractionReplyOptions,
    ButtonStyle,
} from "discord.js";
import * as Db from "../../core/classes/database";
import { HgdEmbedBuilder } from "../../core/classes/hgd/hgdEmbedBuilder";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";
import {
    JaneHgdButtonActions,
    JaneInteractionGroup,
    JaneInteractionType,
} from "../../types/enums";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "好感度排行榜",
    command: "hgd-leaderboard",
    aliases: ["lb", "好感度排行"],
    category: "好感度",
    description: "查看好感度排行榜",
    usage: "hgd-leaderboard",
    args: [],
};

export async function getHgdLbMessagePayload(
    client: JaneClient,
    initiator: CommandInitiator,
    page = 0
): Promise<Common<ReplyMessageOptions, InteractionReplyOptions>> {
    const hgdRanking = await Db.Database.collection
        .find()
        .sort({ hgd: -1 })
        .toArray();

    let initiatorUser: Db.User | undefined = undefined;
    if (hgdRanking.filter((i) => i.snowflake === initiator.id).length) {
        initiatorUser = new Db.User(
            hgdRanking.find(
                (i) => i.snowflake === initiator.id
            ) as DatabaseUserData
        );
    }

    let lbBody = "";
    const sliceStart = Math.max(
        0,
        Math.min(0 + page * 10, hgdRanking.length - 10)
    );
    const sliceEnd = sliceStart + 10;
    for (let [rank, userDocument] of hgdRanking.entries()) {
        if (rank < sliceStart) continue;
        if (rank >= sliceEnd) continue;
        const user = new Db.User(userDocument as DatabaseUserData);
        rank++;
        lbBody +=
            userDocument.snowflake === "726439536401580114"
                ? `**#1 Lv.∞ ${user.discordTag} (簡的母親)**\n\t好感度: 無限`
                : `**#${rank} Lv.${user.hgdData?.levelData.level} ${user.discordTag}**\n\t好感度: ${user.hgdData?.hgd}`;
        lbBody += "\n";
    }
    let prevBtnDisabled = sliceStart === 0;
    let nextBtnDisabled = hgdRanking.length === sliceEnd;

    return {
        embeds: [
            new HgdEmbedBuilder(
                initiatorUser ??
                    new Db.User({
                        snowflake: initiator.id,
                        tag: initiator.user.tag,
                    }),
                initiator,
                "好感度排行榜",
                lbBody
            ).setAuthor({
                iconURL: initiator.user.displayAvatarURL(),
                name: initiator.user.tag,
            }),
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setEmoji({ id: "1013803101129543690" })
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(prevBtnDisabled)
                    .setCustomId(
                        `J-${JaneInteractionType.BUTTON}-${
                            JaneInteractionGroup.HGD
                        }-${JaneHgdButtonActions.SHOW_LB}-${page - 1}`
                    ),
                new ButtonBuilder()
                    .setEmoji({ id: "1013802785910833234" })
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(nextBtnDisabled)
                    .setCustomId(
                        `J-${JaneInteractionType.BUTTON}-${
                            JaneInteractionGroup.HGD
                        }-${JaneHgdButtonActions.SHOW_LB}-${page + 1}`
                    )
            ),
        ],
    };
}

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator
) {
    await initiator.strictReply(
        await getHgdLbMessagePayload(client, initiator, 0)
    );
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
