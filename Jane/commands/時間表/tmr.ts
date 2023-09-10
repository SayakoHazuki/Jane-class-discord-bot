import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { Database } from "../../core/classes/database";
import { initLogger } from "../../core/logger";
import {
    getNormalTimetableActions,
    Timetable,
} from "../../utils/timetableUtils";
import {
    DiscordTimestamp,
    formatTimeString,
} from "../../utils/utility-functions";
import {
    fetchWeatherWarnings,
    HkoWarningStatementCode,
} from "../../utils/hkoUtils";
import { JaneEmbedBuilder } from "../../utils/embedBuilder";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Colors,
    EmbedBuilder,
    User,
} from "discord.js";
import { JaneBaseError, JaneGeneralError } from "../../core/classes/errors";
import {
    ErrorCode,
    JaneDatabaseActions,
    JaneInteractionGroup,
    JaneInteractionType,
} from "../../types/enums";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "翌日時間表",
    command: "tomorrow",
    aliases: ["tmr"],
    category: "時間表",
    description: "查看翌日課堂時間表",
    usage: "tmr",
    args: [
        {
            name: "班別",
            type: "string",
            description: "要查看的班別, 預設為已儲存的班別(如有)",
            required: false,
        },
    ],
};

async function commandCallback(
    client: JaneClientT,
    initiator: CommandInitiator,
    ...args: [string]
) {
    const user = await Database.getUser(initiator.user.id).catch((e) => {
        Logger.fatal(e);
        return undefined;
    });

    let inputClass = args[0] as ClassId;
    if (!inputClass) {
        if (user?.studentClass) {
            inputClass = user.studentClass;
        } else {
            await initiator.strictReply({
                content: "第一次使用此指令需先輸入你的班別",
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                `J-${JaneInteractionType.BUTTON}-${JaneInteractionGroup.DATABASE}-${JaneDatabaseActions.CREATE_USER}-0` as JaneInteractionId
                            )
                            .setLabel(`按此繼續`)
                            .setStyle(ButtonStyle.Primary)
                    ),
                ],
            });
            return;
        }
    }

    const dateOfTmr = formatTimeString(
        new Date(new Date().setDate(new Date().getDate() + 1)),
        "dd/MM"
    ) as TimetableDateResolvable;

    Logger.info(`d: ${dateOfTmr}, c: ${inputClass}, f:${args}`);
    const timetable = new Timetable(inputClass, dateOfTmr, initiator, user);

    const weatherWarningEmbeds = await getWeatherWarningEmbeds();

    const embed = await timetable.getEmbed();
    await initiator.strictReply({
        content: "",
        embeds: [...weatherWarningEmbeds, embed],
        components: [getNormalTimetableActions(dateOfTmr, inputClass)],
    });
    return;
}

async function getWeatherWarningEmbeds() {
    const weatherWarningEmbeds: EmbedBuilder[] = [];
    const weatherWarningsData = await fetchWeatherWarnings();
    if (
        HkoWarningStatementCode.TROPICAL_CYCLONE_WARNING_SIGNAL in
        weatherWarningsData
    ) {
        const tcWarning =
            weatherWarningsData[
                HkoWarningStatementCode.TROPICAL_CYCLONE_WARNING_SIGNAL
            ];
        if (
            ["TC8NE", "TC8SE", "TC8NW", "TC8SW", "TC9", "TC10"].includes(
                tcWarning?.code ?? ""
            )
        ) {
            weatherWarningEmbeds.push(
                new JaneEmbedBuilder(
                    "info",
                    `${tcWarning?.type ?? tcWarning?.name} 現正生效`,
                    `天文台已於 ${new DiscordTimestamp(
                        new Date(tcWarning?.issueTime ?? new Date()),
                        "f"
                    )} 發出 ${
                        tcWarning?.type ?? tcWarning?.name
                    }, 請留意相關天氣資訊`,
                    { color: Colors.Yellow }
                ).setThumbnail(
                    `https://www.hko.gov.hk/en/wxinfo/dailywx/images/${tcWarning?.code.toLowerCase()}.gif`
                )
            );
        }
        if (["TC1", "TC3"].includes(tcWarning?.code ?? "")) {
            weatherWarningEmbeds.push(
                new JaneEmbedBuilder(
                    "info",
                    `${tcWarning?.type ?? tcWarning?.name} 現正生效`,
                    `天文台已於 ${new DiscordTimestamp(
                        new Date(tcWarning?.issueTime ?? new Date()),
                        "f"
                    )} 發出 ${
                        tcWarning?.type ?? tcWarning?.name
                    }, 請繼續留意相關天氣資訊`,
                    {}
                ).setThumbnail(
                    `https://www.hko.gov.hk/en/wxinfo/dailywx/images/${tcWarning?.code.toLowerCase()}.gif`
                )
            );
        }
    }
    if (HkoWarningStatementCode.THUNDERSTORM_WARNING in weatherWarningsData) {
        const tdsWarning =
            weatherWarningsData[HkoWarningStatementCode.THUNDERSTORM_WARNING];
        switch (tdsWarning?.code ?? "") {
            case "WRAINA":
                weatherWarningEmbeds.push(
                    new JaneEmbedBuilder(
                        "info",
                        "黃色暴雨警告信號 現正生效",
                        `天文台已於 ${new DiscordTimestamp(
                            new Date(tdsWarning?.issueTime ?? new Date()),
                            "f"
                        )} 發出 黃色暴雨警告信號, 請繼續留意相關天氣資訊`,
                        {}
                    ).setThumbnail(
                        `https://www.hko.gov.hk/en/wxinfo/dailywx/images/${tdsWarning?.code.toLowerCase()}.gif`
                    )
                );
                break;
            case "WRAINR":
                weatherWarningEmbeds.push(
                    new JaneEmbedBuilder(
                        "info",
                        "紅色暴雨警告信號 現正生效",
                        `天文台已於 ${new DiscordTimestamp(
                            new Date(tdsWarning?.issueTime ?? new Date()),
                            "f"
                        )} 發出 紅色暴雨警告信號, 請留意相關天氣資訊`,
                        {}
                    ).setThumbnail(
                        `https://www.hko.gov.hk/en/wxinfo/dailywx/images/${tdsWarning?.code.toLowerCase()}.gif`
                    )
                );
                break;
            case "WRAINB":
                weatherWarningEmbeds.push(
                    new JaneEmbedBuilder(
                        "info",
                        "黑色暴雨警告信號 現正生效",
                        `天文台已於 ${new DiscordTimestamp(
                            new Date(tdsWarning?.issueTime ?? new Date()),
                            "f"
                        )} 發出 黑色暴雨警告信號, 請留意相關天氣資訊`,
                        {}
                    ).setThumbnail(
                        `https://www.hko.gov.hk/en/wxinfo/dailywx/images/${tdsWarning?.code.toLowerCase()}.gif`
                    )
                );
                break;
        }
    }
    return weatherWarningEmbeds;
}

export const command = class TestCommand extends CommandBuilder {
    constructor() {
        super(commandOptions, commandCallback);
    }
};
