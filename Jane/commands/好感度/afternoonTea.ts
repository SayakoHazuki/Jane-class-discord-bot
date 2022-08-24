import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdAfternoonTeaCommand extends HgdCommandBuilder {
  constructor() {
    super("給簡準備下午茶", ["幫簡準備下午茶", "準備下午茶給簡"], {
      commandCode: Enum.CamelHgdActions.afternoonTea,
      commandName: "給簡準備下午茶",
      coolDown: 600,
      emoji: {
        fullId: Emojis.hgdActionEmojis.afternoonTea,
        name: Emojis.hgdActionEmojis.afternoonTea,
        numericId: "0",
      },
      texts: {
        ACTION_NAME: ["給簡準備下午茶"],
        ACTION_MESSAGE: ["$dcUser.username 給簡準備了下午茶"],
        SUCCESS_ACTION_MESSAGE: ["簡很喜歡您給的下午茶"],
        TIME_CONDITION_MISMATCH: ["現在已經不是下午茶時段了哦～"],
        FAILURE_ACTION_MESSAGE: ["簡今天已經吃過您準備的下午茶了"],
        SUCCESS_FOOTER_MESSAGE: ["喜歡吃下午茶的簡"],
      },
      punishments: { min: -1, max: -5 },
      rewards: { min: 25, max: 40 },
      runCode: Enum.JaneHgdButtonRunCode.afternoonTea,
    });
  }
};
