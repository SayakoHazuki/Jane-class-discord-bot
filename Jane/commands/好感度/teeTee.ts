import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdTeeTeeCommand extends HgdCommandBuilder {
  constructor() {
    super("和簡貼貼", [], {
      commandCode: Enum.CamelHgdActions.teeTee,
      commandName: "和簡貼貼",
      coolDown: 60,
      lvRequirement: 25,
      emoji: {
        fullId: Emojis.hgdActionEmojis.teeTee,
        name: "jane_love",
        numericId: "904738308385554482",
      },
      messages: {
        ACTION_MESSAGE_1: ["test"],
        ACTION_MESSAGE_2: ["test"],
        DAY_CONDITION_MISMATCH: ["test"],
        TIME_CONDITION_MISMATCH: ["test"],
      },
      punishments: { min: -3, max: -5 },
      rewards: { min: 20, max: 60 },
    });
  }
};
