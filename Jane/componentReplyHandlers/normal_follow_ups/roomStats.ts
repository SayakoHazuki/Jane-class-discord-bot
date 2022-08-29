import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import {
    areas,
    floors,
    getRoomStatsArray,
} from "../../commands/資訊/roomStats";
import { JaneGeneralError } from "../../core/classes/errors";
import { ButtonInitiator } from "../../core/commandInitiator";
import { initLogger } from "../../core/logger";
import {
    ErrorCode,
    JaneInteractionGroup,
    JaneInteractionNormalFollowUpSubgroups,
    JaneInteractionType,
} from "../../types/enums";
import { JaneEmbedBuilder } from "../../utils/embedBuilder";

const Logger = initLogger(__filename);

export async function handleRoomStatsNavigation(
    initiator: ButtonInitiator,
    v: string
) {
    const [date, floor, area, newRoomPosStr] = v.split("_") as [
        string,
        string,
        string,
        string
    ];

    const newRoomPos = Number(newRoomPosStr);
    if (!date || !floor || !area || !newRoomPos)
        throw new JaneGeneralError("", ErrorCode.UNEXPECTED_UNDEFINED);

    await initiator.initiator.deferReply();
    const roomStatsArray = await getRoomStatsArray(
        date,
        floor,
        area,
        newRoomPos
    );

    initiator.initiator.deferUpdate();
    await initiator.initiator.message.edit({
        embeds: [
            new JaneEmbedBuilder(
                "reply",
                `${date} ${floors[Number(floor) as 0 | 1 | 2 | 3 | 4 | 5]}${
                    areas[Number(area) as 0 | 1 | 2]
                }`,
                `**${roomStatsArray[newRoomPos].room}**\n\n${roomStatsArray[
                    newRoomPos
                ].sections
                    .map(
                        ({ section, occupied, occupier }) =>
                            `${section}\n${
                                occupied ? "Booked by " : ""
                            }**${occupier}**`
                    )
                    .join("\n")}`,
                {}
            ),
        ],
        components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `J-${JaneInteractionType.BUTTON}-${
                            JaneInteractionGroup.NORMAL_FOLLOW_UP
                        }-${
                            JaneInteractionNormalFollowUpSubgroups.room_stats_navigation
                        }-${date}_${floor}_${area}_${newRoomPos - 1}`
                    )
                    .setEmoji({ id: "1013803101129543690" })
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`RESERVED_1`)
                    .setLabel(roomStatsArray[0].room)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(
                        `J-${JaneInteractionType.BUTTON}-${
                            JaneInteractionGroup.NORMAL_FOLLOW_UP
                        }-${
                            JaneInteractionNormalFollowUpSubgroups.room_stats_navigation
                        }-${date}_${floor}_${area}_${newRoomPos + 1}`
                    )
                    .setEmoji({ id: "1013802785910833234" })
                    .setStyle(ButtonStyle.Primary)
            ),
        ],
    });
}
