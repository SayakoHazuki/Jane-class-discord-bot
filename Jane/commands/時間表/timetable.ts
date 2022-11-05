import { JaneClient } from "../../core/client";
import { CommandBuilder } from "../../core/commandBuilder";
import { Database, User } from "../../core/classes/database";
import { initLogger } from "../../core/logger";
import { getTimetableActions, Timetable } from "../../utils/timetableUtils";
import {
    dateFromDateString,
    DiscordTimestamp,
    formatTimeString,
    JaneInteractionIdBuilder,
} from "../../utils/utility-functions";
import {
    fetchWeatherWarnings,
    HkoWarningStatementCode,
} from "../../utils/hkoUtils";
import { JaneEmbedBuilder } from "../../utils/embedBuilder";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Collection,
    CollectorFilter,
    Colors,
    EmbedBuilder,
    ModalSubmitInteraction,
    SelectMenuInteraction,
} from "discord.js";
import { JaneBaseError, JaneGeneralError } from "../../core/classes/errors";
import {
    ErrorCode,
    JaneDatabaseActions,
    JaneInteractionGroup,
    JaneInteractionNormalFollowUpSubgroups,
    JaneInteractionType,
} from "../../types/enums";

const Logger = initLogger(__filename);

const commandOptions: CommandOptions = {
    name: "時間表",
    command: "timetable",
    aliases: ["t", "tt"],
    category: "時間表",
    description: "查看課堂時間表",
    usage: "t 日期? 班別?",
    args: [
        {
            name: "日期",
            type: "string",
            description: "要查看的日期, 例如 `14/8`, `tmr`, `wed`, 預設為本日",
            required: false,
        },
        {
            name: "班別",
            type: "string",
            description: "要查看的班別, 預設為已儲存的班別(如有)",
            required: false,
        },
    ],
};

async function commandCallback(
    client: JaneClient,
    initiator: CommandInitiator,
    ...args: [string, string, TimetableOptions?]
) {
    let [inputDate, inputClass, timetableBuilderOptions] = args as [
        TimetableDateResolvable?,
        ClassId?,
        TimetableOptions?
    ];
    if (inputClass) inputClass = inputClass?.toUpperCase() as ClassId;
    let user = await Database.getUser(initiator.user.id).catch((e) => {
        Logger.warn(e);
        return undefined;
    });
    if (!inputDate)
        inputDate = formatTimeString(
            new Date(),
            "dd/MM"
        ) as TimetableDateResolvable;
    if (!inputClass) {
        if (user?.studentClass) {
            inputClass = user.studentClass;
        } else {
            if (!user) {
                await initiator.strictReply({
                    content: "第一次使用此指令需先輸入你的班別",
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    `J-${JaneInteractionType.BUTTON}-${JaneInteractionGroup.DATABASE}-${JaneDatabaseActions.CREATE_USER}-AWAIT` as JaneInteractionId
                                )
                                .setLabel(`按此繼續`)
                                .setStyle(ButtonStyle.Primary)
                        ),
                    ],
                });

                const btnInteraction = await initiator.channel
                    ?.awaitMessageComponent({
                        filter: (interaction) =>
                            interaction?.customId ===
                                `J-${JaneInteractionType.BUTTON}-${JaneInteractionGroup.DATABASE}-${JaneDatabaseActions.CREATE_USER}-AWAIT` &&
                            interaction?.user?.id === initiator.user.id,
                        time: 180_000,
                    })
                    .catch((e) => {
                        Logger.error(e);
                        return undefined;
                    });

                Logger.warn(`Submitted`, btnInteraction);

                if (
                    !btnInteraction ||
                    !(btnInteraction instanceof ButtonInteraction)
                )
                    return;
                const modalSubmitted = await btnInteraction
                    .awaitModalSubmit({
                        filter: (interaction) =>
                            interaction.customId ===
                                `J-${JaneInteractionType.MODAL}-${JaneInteractionGroup.DATABASE}-${JaneDatabaseActions.UPDATE}-0` &&
                            interaction.user.id === initiator.user.id,
                        time: 180_000,
                    })
                    .catch((e) => {
                        Logger.error(e);
                        return undefined;
                    });

                const tmpinputClass =
                    modalSubmitted?.fields.getTextInputValue("class") ?? "";
                if (/^(?:[1-6][A-D])|(?:3E)$/.test(tmpinputClass)) {
                    inputClass = tmpinputClass as ClassId;
                }
            }
            if (
                user &&
                (!user.studentClass ||
                    !/^(?:[1-6][A-D])|(?:3E)$/.test(user.studentClass))
            ) {
                await initiator.strictReply({
                    content: "使用此指令前請先輸入你的班別",
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    `J-${JaneInteractionType.BUTTON}-${JaneInteractionGroup.DATABASE}-${JaneDatabaseActions.CREATE_USER}-AWAIT` as JaneInteractionId
                                )
                                .setLabel(`按此繼續`)
                                .setStyle(ButtonStyle.Primary)
                        ),
                    ],
                });

                const btnInteraction = await initiator.channel
                    ?.awaitMessageComponent({
                        filter: (interaction) =>
                            interaction?.customId ===
                                `J-${JaneInteractionType.BUTTON}-${JaneInteractionGroup.DATABASE}-${JaneDatabaseActions.CREATE_USER}-AWAIT` &&
                            interaction?.user?.id === initiator.user.id,
                        time: 180_000,
                    })
                    .catch((e) => {
                        Logger.error(e);
                        return undefined;
                    });

                Logger.warn(`Submitted`, btnInteraction);

                if (
                    !btnInteraction ||
                    !(btnInteraction instanceof ButtonInteraction)
                )
                    return;
                const modalSubmitted = await btnInteraction
                    .awaitModalSubmit({
                        filter: (interaction) =>
                            interaction.customId ===
                                `J-${JaneInteractionType.MODAL}-${JaneInteractionGroup.DATABASE}-${JaneDatabaseActions.UPDATE}-0` &&
                            interaction.user.id === initiator.user.id,
                        time: 180_000,
                    })
                    .catch((e) => {
                        Logger.error(e);
                        return undefined;
                    });

                const tmpinputClass =
                    modalSubmitted?.fields.getTextInputValue("class") ?? "";
                if (/^(?:[1-6][A-D])|(?:3E)$/.test(tmpinputClass)) {
                    inputClass = tmpinputClass as ClassId;
                }
            }
        }
    }

    if (!inputClass) return;
    Logger.info(`d: ${inputDate}, c: ${inputClass}, f:${args}`);
    const timetable = new Timetable(inputClass, inputDate, initiator, user);

    const weatherWarningEmbeds = await getWeatherWarningEmbeds();

    const inputDateObj = dateFromDateString(inputDate);
    const inputDateStr = formatTimeString(
        inputDateObj,
        "dd/MM"
    ) as TimetableDateResolvable;

    const embed = await timetable.getEmbed();
    if (
        timetableBuilderOptions?.editMessage &&
        timetableBuilderOptions?.message !== undefined
    ) {
        await timetableBuilderOptions.message.edit({
            content: "",
            embeds: [...weatherWarningEmbeds, embed],
            components: [getTimetableActions(inputDateStr, inputClass)],
        });
        return;
    }
    await initiator.strictReply({
        content: "",
        embeds: [...weatherWarningEmbeds, embed],
        components: [getTimetableActions(inputDateStr, inputClass)],
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
