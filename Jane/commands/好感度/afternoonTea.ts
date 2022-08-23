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
      messages: {
        ACTION_MESSAGE_1: ["test"],
        ACTION_MESSAGE_2: ["test"],
        DAY_CONDITION_MISMATCH: ["test"],
        TIME_CONDITION_MISMATCH: ["test"],
      },
      punishments: { min: -1, max: -5 },
      rewards: { min: 25, max: 40 },
    });
  }
};
