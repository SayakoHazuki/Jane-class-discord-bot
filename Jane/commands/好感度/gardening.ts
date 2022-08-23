import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdFilesCommand extends HgdCommandBuilder {
  constructor() {
    super(
      "幫簡打理花園",
      ["和簡打理花園", "協助簡打理花園", "幫助簡打理花園"],
      {
        commandCode: Enum.CamelHgdActions.gardening,
        commandName: "幫簡打理花園",
        coolDown: 1080,
        lvRequirement: 10,
        dayCondition: { in: [6, 0] },
        timeCondition: { after: "07:00", before: "19:00" },
        emoji: {
          fullId: Emojis.hgdActionEmojis.gardening,
          name: "watercan",
          numericId: "938673732510183474",
        },
        messages: {
          ACTION_MESSAGE_1: ["test"],
          ACTION_MESSAGE_2: ["test"],
          DAY_CONDITION_MISMATCH: ["test"],
          TIME_CONDITION_MISMATCH: ["test"],
        },
        punishments: { min: -1, max: -10 },
        rewards: { min: 20, max: 38 },
      }
    );
  }
};
