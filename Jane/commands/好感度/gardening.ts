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
        texts: {
          ACTION_NAME: ["和簡打理花園"],
          ACTION_MESSAGE: [
            "$dcUser.username 協助了簡打理花園",
            "簡很感謝您的幫忙",
          ],
          SUCCESS_ACTION_MESSAGE: ["簡很感謝您協助打理花園"],
          FAILURE_ACTION_MESSAGE: ["今天已經打理過花園了, 目前無需再打理"],
          SUCCESS_FOOTER_MESSAGE: ["感到開心的簡", "十分感激的簡"],
          TIME_CONDITION_MISMATCH: ["簡現在似乎有其他的工作要做呢"],
          DAY_CONDITION_MISMATCH: ["請等待周末再來和簡打理花園"],
        },
        punishments: { min: -1, max: -10 },
        rewards: { min: 20, max: 38 },
        runCode: Enum.JaneHgdButtonRunCode.gardening,
      }
    );
  }
};
