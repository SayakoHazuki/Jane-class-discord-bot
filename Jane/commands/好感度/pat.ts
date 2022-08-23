import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdPatCommand extends HgdCommandBuilder {
  constructor() {
    super("拍拍簡的頭", [], {
      commandCode: Enum.CamelHgdActions.pat,
      commandName: "拍拍簡的頭",
      coolDown: 30,
      lvRequirement: 15,
      emoji: {
        fullId: Emojis.hgdActionEmojis.pat,
        name: "pat",
        numericId: "938672745993109527",
      },
      messages: {
        ACTION_MESSAGE_1: ["test"],
        ACTION_MESSAGE_2: ["test"],
        DAY_CONDITION_MISMATCH: ["test"],
        TIME_CONDITION_MISMATCH: ["test"],
      },
      punishments: { min: 25, max: 45 },
      rewards: { min: -5, max: -10 },
    });
  }
};
