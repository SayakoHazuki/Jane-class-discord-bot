import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdFilesCommand extends HgdCommandBuilder {
  constructor() {
    super("幫助簡整理資料", ["幫簡整理資料", "整理資料"], {
      commandCode: Enum.CamelHgdActions.files,
      commandName: "幫助簡整理資料",
      coolDown: 15,
      emoji: {
        fullId: Emojis.hgdActionEmojis.files,
        name: Emojis.hgdActionEmojis.files,
        numericId: "0",
      },
      texts: {
        ACTION_NAME: ["幫助簡整理資料"],
        ACTION_MESSAGE: ["$dcUser.username 幫助了簡整理資料"],
        SUCCESS_ACTION_MESSAGE: ["簡感到開心"],
        FAILURE_ACTION_MESSAGE: [
          "你不久前整理過簡的資料了,\n沒有其他資料需要整理",
        ],
        SUCCESS_FOOTER_MESSAGE: ["感到開心的簡"],
      },
      punishments: { min: -1, max: -5 },
      rewards: { min: 15, max: 30 },
      runCode: Enum.JaneHgdButtonRunCode.files,
    });
  }
};
