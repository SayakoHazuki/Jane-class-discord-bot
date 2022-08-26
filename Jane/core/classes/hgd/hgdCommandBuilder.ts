import {
    formatTimeString,
    randomFromRange,
} from "../../../utils/utility-functions";
import { JaneClient } from "../../client";
import { CommandBuilder } from "../../commandBuilder";
import { initLogger } from "../../logger";
import { HgdEmbedBuilder } from "./hgdEmbedBuilder";
import hgdSystemConfig from "../../../data/config/hgdVariables.json";
import { User } from "discord.js";
import { User as DbUser } from "../../classes/database";
import { HgdActionRowBuilder } from "./hgdActionRow";
import * as Enum from "../../../types/enums";
import { JaneGeneralError } from "../errors";
import * as Database from "../database";

const Logger = initLogger(__filename);

function pickRandomText(texts: string[]) {
    return texts[Math.floor(Math.random() * texts.length)];
}

class HgdTextsFormatter {
    dcUser: User;
    dbUser: DbUser;

    constructor(dcUser: User, dbUser: DbUser) {
        this.dcUser = dcUser;
        this.dbUser = dbUser;
    }

    pickAndFormat(texts: string[]) {
        return this.format(pickRandomText(texts));
    }

    format(str: string) {
        return str.replace(
            /\$(dcUser|dbUser)\.(\w+)/g,
            (a, b: "dcUser" | "dbUser", c) => {
                Logger.warn(`(HgdTextsFormatter) ${a} - ${b} - ${c}`);
                let tmp: any = this[b];
                for (const i of c.split(".")) {
                    tmp = tmp[i];
                }
                return tmp.toString?.() ?? tmp;
            }
        );
    }
}

export class HgdCommandBuilder extends CommandBuilder {
    constructor(command: string, aliases: string[], config: HgdActionConfig) {
        JaneClient.getClient()?.registerHgdActionConfig(config);

        const commandOptions: CommandOptions = {
            name: command,
            command: command,
            aliases: aliases,
            category: "好感度",
            description: command,
            usage: command,
            args: [],
        };

        const commandCallback = async (
            client: JaneClient,
            initiator: CommandInitiator
        ) => {
            let dbUser = await Database.Database.getUser(
                initiator.user.id
            ).catch((e) => {
                Logger.warn(e);
                return undefined;
            });
            if (!dbUser)
                dbUser = await Database.Database.insertUser(initiator.user);
            const userdata = dbUser.hgdData;

            const textsFormatter = new HgdTextsFormatter(
                initiator.user,
                dbUser
            );

            if (userdata == undefined) {
                throw new JaneGeneralError(
                    "Database user's hgddata is unexpectedly undefined",
                    Enum.ErrorCode.UNEXPECTED_UNDEFINED
                );
            }

            if (config.lvRequirement !== undefined) {
                const userLevel = userdata.levelData.level;
                if (!(userLevel >= config.lvRequirement)) {
                    await initiator.strictReply({
                        embeds: [
                            new HgdEmbedBuilder(
                                dbUser,
                                initiator,
                                "無法使用指令",
                                `您未達到可以進行該動作的等級 (${userLevel}/${config.lvRequirement})`
                            ),
                        ],
                    });
                    return;
                }
            }

            if (config.dayCondition !== undefined) {
                const currentDayOfWeek = new Date().getDay();
                let dayConditionPass = true;
                if ("in" in config.dayCondition) {
                    dayConditionPass =
                        config.dayCondition.in.includes(currentDayOfWeek);
                } else {
                    dayConditionPass =
                        !config.dayCondition.notIn.includes(currentDayOfWeek);
                }

                if (!dayConditionPass) {
                    await initiator.strictReply({
                        embeds: [
                            new HgdEmbedBuilder(
                                dbUser,
                                initiator,
                                "無法使用指令",
                                textsFormatter.pickAndFormat(
                                    config.texts
                                        .DAY_CONDITION_MISMATCH as string[]
                                )
                            ),
                        ],
                    });
                    return;
                }
            }

            if (config.timeCondition !== undefined) {
                const current = new Date();
                const currentTimeString = `${formatTimeString(
                    current,
                    "HH:mm"
                )}`;

                let timeConditionPass = true;
                if (config.timeCondition.after > config.timeCondition.before) {
                    timeConditionPass =
                        (currentTimeString >= config.timeCondition.after &&
                            currentTimeString <= "23:59") ||
                        (currentTimeString <= config.timeCondition.before &&
                            currentTimeString >= "00:00");
                } else {
                    timeConditionPass =
                        currentTimeString >= config.timeCondition.after &&
                        currentTimeString <= config.timeCondition.before;
                }

                if (!timeConditionPass) {
                    await initiator.strictReply({
                        embeds: [
                            new HgdEmbedBuilder(
                                dbUser,
                                initiator,
                                "無法使用指令",
                                textsFormatter.pickAndFormat(
                                    config.texts
                                        .TIME_CONDITION_MISMATCH as string[]
                                )
                            ),
                        ],
                    });
                    return;
                }
            }

            let diffPass = true;
            if (config.coolDown !== undefined) {
                if (
                    userdata.actionRecords == undefined ||
                    !userdata.actionRecords[
                        Enum.PascalHgdActions[config.commandCode]
                    ]
                ) {
                    Logger.fatal(
                        JSON.stringify(userdata.actionRecords, null, 2)
                    );
                    throw new Error(undefined);
                }
                const lastRunTimestamp =
                    userdata.actionRecords[
                        Enum.PascalHgdActions[config.commandCode]
                    ];
                const currentTimestamp = Math.floor(
                    new Date().getTime() / 1000
                );
                const differenceInMins =
                    (currentTimestamp - lastRunTimestamp) / 60;
                if (config.coolDown > differenceInMins) {
                    diffPass = false;
                }
            }

            if (diffPass) {
                const shardPossibility =
                    (userdata.levelData.levelConfig.shardPerc / 100) *
                    hgdSystemConfig.multipliers.shardChance;
                const spinRes: 0 | 1 = Math.random() < shardPossibility ? 1 : 0;
                let rewardShardsNumber = 0;
                if (spinRes === 1) {
                    rewardShardsNumber = randomFromRange(
                        userdata.levelData.levelConfig.shardRange
                    );
                }
                const newUserShardAmount =
                    (dbUser.hgdData?.shards ?? 0) + rewardShardsNumber;
                dbUser.commitUpdate("shards", newUserShardAmount);

                const rewardHgdNumber = randomFromRange([
                    config.rewards.max,
                    config.rewards.min,
                ]);
                const newUserHgdAmount =
                    (dbUser.hgdData?.hgd ?? 0) + rewardHgdNumber;
                dbUser.commitUpdate("hgd", newUserHgdAmount);

                dbUser.commitUpdate(
                    `last${Enum.PascalHgdActions[config.commandCode]}`,
                    Math.floor(new Date().getTime() / 1000)
                );

                const textsFormatter = new HgdTextsFormatter(
                    initiator.user,
                    dbUser
                );
                const message1 = textsFormatter.pickAndFormat(
                    config.texts.ACTION_MESSAGE
                );

                const message2 = textsFormatter.pickAndFormat(
                    config.texts.SUCCESS_ACTION_MESSAGE
                );

                const footer = textsFormatter.pickAndFormat(
                    config.texts.SUCCESS_FOOTER_MESSAGE
                );

                /* without cache */
                const newDbUser = await dbUser.pushUpdates();

                await initiator.strictReply({
                    embeds: [
                        new HgdEmbedBuilder(
                            newDbUser,
                            initiator,
                            message1,
                            `${message2}\n好感度+${rewardHgdNumber} (${
                                newDbUser.hgdData?.hgd ?? 0
                            } \u279f ${
                                newDbUser.hgdData?.highLvLocked ? "🔒" : ""
                            } ${newUserHgdAmount})${
                                rewardShardsNumber > 0
                                    ? "\n好感度解放碎片+" +
                                      rewardShardsNumber +
                                      `(${
                                          newDbUser.hgdData?.shards ?? 0
                                      } \u279f ${newUserShardAmount})`
                                    : ""
                            }`.replace(/900[0-9]{6, 12}/g, "∞"),
                            footer
                        ),
                    ],
                    components: [new HgdActionRowBuilder(newDbUser)],
                });
            } else {
                const punishmentHgdNumber = Math.abs(
                    randomFromRange([
                        config.punishments.max,
                        config.punishments.min,
                    ])
                );
                const newUserHgdAmount =
                    (dbUser.hgdData?.hgd ?? 0) - punishmentHgdNumber;
                dbUser.commitUpdate("hgd", newUserHgdAmount);

                dbUser.commitUpdate(
                    `last${Enum.PascalHgdActions[config.commandCode]}`,
                    Math.floor(new Date().getTime() / 1000)
                );

                const messageFormatter = new HgdTextsFormatter(
                    initiator.user,
                    dbUser
                );
                const message1 = textsFormatter.pickAndFormat(
                    config.texts.ACTION_MESSAGE
                );

                const message2 = textsFormatter.pickAndFormat(
                    config.texts.FAILURE_ACTION_MESSAGE
                );

                /* without cache */
                const newDbUser = await dbUser.pushUpdates();

                await initiator.strictReply({
                    embeds: [
                        new HgdEmbedBuilder(
                            newDbUser,
                            initiator,
                            message1,
                            `${message2}\n好感度-${punishmentHgdNumber} (${
                                newDbUser.hgdData?.hgd ?? 0
                            } \u279f ${
                                newDbUser.hgdData?.highLvLocked ? "🔒" : ""
                            } ${newUserHgdAmount})`.replace(
                                /900[0-9]{6, 12}/g,
                                "∞"
                            ),
                            "簡"
                        ),
                    ],
                    components: [new HgdActionRowBuilder(newDbUser)],
                });
            }
        };

        super(commandOptions, commandCallback);
    }
}
