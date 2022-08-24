import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdNightCommand extends HgdCommandBuilder {
  constructor() {
    super(
      "晚安簡",
      [
        "簡晚安",
        "簡晚安~",
        "晚安簡~",
        "簡晚",
        "晚安",
        "晚",
        "晚!",
        "晚安!簡",
        "簡晚安!",
      ],
      {
        commandCode: Enum.CamelHgdActions.night,
        commandName: "晚安簡",
        coolDown: 720,
        timeCondition: { after: "18:30", before: "01:00" },
        emoji: {
          fullId: Emojis.hgdActionEmojis.night,
          name: Emojis.hgdActionEmojis.night,
          numericId: "0",
        },
        texts: {
          ACTION_NAME: ["和簡說晚安"],
          ACTION_MESSAGE: ["晚安, $dcUser.username"],
          SUCCESS_ACTION_MESSAGE: [
            "明天也請加油哦!",
            "已經要睡了嗎, $dcUser.username",
          ],
          FAILURE_ACTION_MESSAGE: ["剛才已經跟簡說過晚安了喔"],
          SUCCESS_FOOTER_MESSAGE: ["正在喝花茶的簡"],
          TIME_CONDITION_MISMATCH: ["已經很晚了呢，簡似乎已經在睡覺了"],
        },
        punishments: { min: -1, max: -2 },
        rewards: { min: 20, max: 35 },
        runCode: Enum.JaneHgdButtonRunCode.night,
      }
    );
  }
};
