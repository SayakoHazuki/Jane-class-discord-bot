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
        messages: {
          ACTION_MESSAGE_1: ["test"],
          ACTION_MESSAGE_2: ["test"],
          DAY_CONDITION_MISMATCH: ["test"],
          TIME_CONDITION_MISMATCH: ["test"],
        },
        punishments: { min: -1, max: -2 },
        rewards: { min: 20, max: 35 },
      }
    );
  }
};
