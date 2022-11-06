import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import { JaneGeneralError } from "../../core/classes/errors";
import { PycClient } from "../../core/classes/pyc";
import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { initLogger } from "../../core/logger";
import {
    ErrorCode,
    JaneInteractionGroup,
    JaneInteractionNormalFollowUpSubgroups,
    JaneInteractionType,
} from "../../types/enums";
import { JaneEmbedBuilder } from "../../utils/embedBuilder";
import { formatTimeString } from "../../utils/utility-functions";

const Logger = initLogger(__filename);

export const floors = {
    0: "地下",
    1: "一樓",
    2: "二樓",
    3: "三樓",
    4: "四樓",
    5: "五樓",
};

export const areas = {
    0: "一般課室",
    1: "特別室",
    2: "新翼課室",
};

const commandOptions: CommandOptions = {
    name: "課室使用狀態",
    command: "room-stats",
    aliases: ["rms"],
    category: "資訊",
    description: "查看學校的課室/特別室借用紀錄",
    usage: "room-stats",
    args: <CommandArgument[]>[
        {
            name: "樓層",
            type: "string",
            choices: [
                { name: "G/F", value: "0" },
                { name: "1/F", value: "1" },
                { name: "2/F", value: "2" },
                { name: "3/F", value: "3" },
                { name: "4/F", value: "4" },
                { name: "5/F", value: "5" },
            ],
            description: "樓層",
            required: true,
        },
        {
            name: "區域",
            type: "string",
            choices: [
                { name: "一般課室", value: "0" },
                { name: "特別室", value: "1" },
                { name: "新翼課室", value: "2" },
            ],
            description: "區域",
            required: true,
        },
        {
            name: "日期",
            type: "string",
            description: "日期 - 請使用 日/月/年 的格式",
            required: false,
        },
    ],
};

export async function getRoomStatsArray(
    date: string,
    floor: string,
    area: string,
    currentRoomPos = 0
) {
    if (!date) date = formatTimeString(new Date(), "dd/MM/yyyy");
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date))
        throw new JaneGeneralError(
            "Incorrect date format",
            ErrorCode.UNEXPECTED_INPUT_FORMAT
        );
    const cached = JaneClient.getClient()?.cache.collections.roomStats.has(
        `rooms-${date}-${floor}-${area}`
    );
    const pyc = new PycClient(process.env.PYCA, process.env.PYCB);
    if (!cached) await pyc.login();
    const roomStats = cached
        ? {}
        : await pyc.getRoomStats(
              date as `${number}/${number}/${number}`,
              floor,
              area
          );
    const roomStatsArray = cached
        ? (JaneClient.getClient()?.cache.collections.roomStats?.get(
              `rooms-${date}-${floor}-${area}`
          ) as {
              room: string;
              sections: {
                  section: string;
                  occupied: boolean;
                  occupier: string;
              }[];
          }[])
        : new Array(Object.keys(roomStats).length)
              .fill(undefined)
              .map((v, i) => {
                  const sectionsArray = [];
                  for (const section in roomStats[
                      Object.keys(roomStats).sort()[i]
                  ]) {
                      sectionsArray.push({
                          section: section.replace(/<br>/g, " "),
                          occupied: !(
                              roomStats[Object.keys(roomStats).sort()[i]][
                                  section
                              ] === "empty"
                          ),
                          occupier:
                              roomStats[Object.keys(roomStats).sort()[i]][
                                  section
                              ],
                      });
                  }
                  return {
                      room: Object.keys(roomStats).sort()[i],
                      sections: sectionsArray,
                  };
              });

    if (currentRoomPos < 0) currentRoomPos += roomStatsArray.length;

    JaneClient.getClient()?.cache.collections.roomStats.set(
        `rooms-${date}-${floor}-${area}`,
        roomStatsArray
    );

    return roomStatsArray;
}

async function commandCallback(
    client: JaneClientT,
    initiator: CommandInitiator,
    floor: string,
    area: string,
    date: string
) {
    if (!date) date = formatTimeString(new Date(), "dd/MM/yyyy");
    const currentRoomPos = 0;
    const roomStatsArray = await getRoomStatsArray(
        date,
        floor,
        area,
        currentRoomPos
    );
    await initiator.strictReply({
        embeds: [
            new JaneEmbedBuilder(
                "reply",
                `${date} ${floors[Number(floor) as 0 | 1 | 2 | 3 | 4 | 5]}${
                    areas[Number(area) as 0 | 1 | 2]
                }`,
                `**${roomStatsArray[currentRoomPos].room}**\n\n${roomStatsArray[
                    currentRoomPos
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
                        }-${date}_${floor}_${area}_${currentRoomPos - 1}`
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
                        }-${date}_${floor}_${area}_${currentRoomPos + 1}`
                    )
                    .setEmoji({ id: "1013802785910833234" })
                    .setStyle(ButtonStyle.Primary)
            ),
        ],
    });
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
