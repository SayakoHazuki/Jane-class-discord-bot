import { JaneEmbedBuilder } from "../../../utils/embedBuilder";
import {
  formatTimeString,
  randomFromRange,
} from "../../../utils/utility-functions";
import { JaneClient } from "../../client";
import { CommandBuilder } from "../../commandBuilder";
import { initLogger } from "../../logger";
import { Database } from "../database";
import { HgdEmbedBuilder } from "./hgdEmbedBuilder";
import hgdSystemConfig from "../../../data/config/hgdVariables.json";
import { ButtonBuilder, User } from "discord.js";
import { User as DbUser } from "../../classes/database";
import { HgdActionRowBuilder } from "./hgdActionRow";
import * as Enum from "../../../types/enums";

const Logger = initLogger(__filename);

function pickMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

class HgdMessageFormatter {
  dcUser: User;
  dbUser: DbUser;

  constructor(dcUser: User, dbUser: DbUser) {
    this.dcUser = dcUser;
    this.dbUser = dbUser;
  }

  format(str: string) {
    return str.replace(
      /\$(dcUser|dbUser)].(\w+)/g,
      (a, b: "dcUser" | "dbUser", c) => {
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
      const dbUser = await Database.getUser(initiator.user.id);

      const userdata = dbUser.hgdData;

      if (userdata == undefined) {
        // ...
        throw new Error(undefined);
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
          dayConditionPass = config.dayCondition.in.includes(currentDayOfWeek);
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
                pickMessage(config.messages.DAY_CONDITION_MISMATCH)
              ),
            ],
          });
          return;
        }
      }

      if (config.timeCondition !== undefined) {
        const current = new Date();
        const currentTimeString = `${formatTimeString(current, "HH:mm")}`;

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
                pickMessage(config.messages.TIME_CONDITION_MISMATCH)
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
          !userdata.actionRecords[Enum.PascalHgdActions[config.commandCode]]
        ) {
          Logger.fatal(JSON.stringify(userdata.actionRecords, null, 2));
          throw new Error(undefined);
        }
        const lastRunTimestamp =
          userdata.actionRecords[Enum.PascalHgdActions[config.commandCode]];
        const currentTimestamp = Math.floor(new Date().getTime() / 1000);
        const differenceInMins = (currentTimestamp - lastRunTimestamp) / 60;
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
        const newUserHgdAmount = (dbUser.hgdData?.hgd ?? 0) + rewardHgdNumber;
        dbUser.commitUpdate("hgd", newUserHgdAmount);

        const messageFormatter = new HgdMessageFormatter(
          initiator.user,
          dbUser
        );
        const message1 = messageFormatter.format(
          pickMessage(config.messages.ACTION_MESSAGE_1)
        );
        const message2 = messageFormatter.format(
          pickMessage(config.messages.ACTION_MESSAGE_2)
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
              }`.replace(/900[0-9]{6, 12}/g, "∞")
            ),
          ],
          components: [new HgdActionRowBuilder(newDbUser)],
        });
      } else {
        // to be completed
      }
    };

    super(commandOptions, commandCallback);
  }
}
