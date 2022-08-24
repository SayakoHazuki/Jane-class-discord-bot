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
      texts: {
        ACTION_NAME: ["拍拍簡的頭"],
        ACTION_MESSAGE: ["$dcUser.username 拍拍了簡的頭"],
        SUCCESS_ACTION_MESSAGE: ["簡覺得開心"],
        FAILURE_ACTION_MESSAGE: ["您拍得太頻繁了, 簡覺得不太自在"],
        SUCCESS_FOOTER_MESSAGE: ["覺得開心的簡"],
      },
      punishments: { min: -5, max: -10 },
      rewards: { min: 25, max: 45 },
      runCode: Enum.JaneHgdButtonRunCode.pat,
    });
  }
};
