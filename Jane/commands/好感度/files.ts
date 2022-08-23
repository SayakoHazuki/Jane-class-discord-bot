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
      messages: {
        ACTION_MESSAGE_1: ["test"],
        ACTION_MESSAGE_2: ["test"],
        DAY_CONDITION_MISMATCH: ["test"],
        TIME_CONDITION_MISMATCH: ["test"],
      },
      punishments: { min: 15, max: 30 },
      rewards: { min: -1, max: -5 },
    });
  }
};
