import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdRoseCommand extends HgdCommandBuilder {
  constructor() {
    super(
      "送給簡一枝白玫瑰",
      [
        "送簡一枝白玫瑰",
        "贈送給簡一枝白玫瑰",
        "贈送簡一枝白玫瑰",
        "送一枝白玫瑰給簡",
        "給簡一枝白玫瑰",
        "給簡贈送一枝白玫瑰",
        "送簡一支白玫瑰",
        "贈送給簡一支白玫瑰",
        "贈送簡一支白玫瑰",
        "送一支白玫瑰給簡",
        "給簡一支白玫瑰",
        "給簡贈送一支白玫瑰",
        "送給簡一支白玫瑰",
      ],
      {
        commandCode: Enum.CamelHgdActions.rose,
        commandName: "送給簡一枝白玫瑰",
        coolDown: 15,
        emoji: {
          fullId: Emojis.hgdActionEmojis.rose,
          name: "roseW",
          numericId: "938672508511617025",
        },
        texts: {
          ACTION_NAME: ["送白玫瑰給簡"],
          ACTION_MESSAGE: ["$dcUser.username 送了一枝白玫瑰給簡"],
          SUCCESS_ACTION_MESSAGE: [
            "簡很喜歡您送的白玫瑰",
            "簡很感謝您送白玫瑰給簡",
          ],
          FAILURE_ACTION_MESSAGE: ["簡剛剛已經收過您送的白玫瑰了"],
          SUCCESS_FOOTER_MESSAGE: ["喜歡白玫瑰的簡"],
        },
        punishments: { min: -2, max: -4 },
        rewards: { min: 10, max: 25 },
        runCode: Enum.JaneHgdButtonRunCode.rose,
      }
    );
  }
};
