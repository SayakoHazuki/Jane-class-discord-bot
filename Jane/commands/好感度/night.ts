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
