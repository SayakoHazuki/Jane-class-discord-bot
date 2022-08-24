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
      texts: {
        ACTION_NAME: ["和簡貼貼"],
        ACTION_MESSAGE: ["$dcUser.username 湊近了簡並和簡貼貼"],
        SUCCESS_ACTION_MESSAGE: ["簡有些侷促但很開心"],
        FAILURE_ACTION_MESSAGE: ["簡似乎覺得有一點不自在"],
        SUCCESS_FOOTER_MESSAGE: ["侷促但很開心的簡"],
      },
      punishments: { min: -3, max: -5 },
      rewards: { min: 20, max: 60 },
      runCode: Enum.JaneHgdButtonRunCode.teeTee,
    });
  }
};
