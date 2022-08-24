import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdMorningCommand extends HgdCommandBuilder {
  constructor() {
    super(
      "早安簡",
      [
        "簡早安",
        "簡早安~",
        "早安簡~",
        "簡早",
        "早安",
        "早",
        "早!",
        "早安!簡",
        "簡早安!",
      ],
      {
        commandCode: Enum.CamelHgdActions.morning,
        commandName: "早安簡",
        coolDown: 1080,
        timeCondition: { after: "05:30", before: "11:30" },
        emoji: {
          fullId: Emojis.hgdActionEmojis.morning,
          name: Emojis.hgdActionEmojis.morning,
          numericId: "0",
        },
        texts: {
          ACTION_NAME: ["和簡說早安"],
          ACTION_MESSAGE: ["$dcUser.username, 早上好!"],
          SUCCESS_ACTION_MESSAGE: [
            "今天有甚麼要做的嗎?",
            "請精神地完成今天要做的事情喔!",
            "$dcUser.username 今天也很早呢!",
          ],
          FAILURE_ACTION_MESSAGE: ["剛才已經跟簡說過早安了喔"],
          SUCCESS_FOOTER_MESSAGE: ["在早上為您打氣的簡"],
          TIME_CONDITION_MISMATCH: ["起床有些晚了呢，簡已經去工作了～"],
        },
        punishments: { min: -1, max: -2 },
        rewards: { min: 20, max: 35 },
        runCode: Enum.JaneHgdButtonRunCode.morning,
      }
    );
  }
};
