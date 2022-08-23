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
        messages: {
          ACTION_MESSAGE_1: ["test"],
          ACTION_MESSAGE_2: ["test"],
          DAY_CONDITION_MISMATCH: ["test"],
          TIME_CONDITION_MISMATCH: ["test"],
        },
        punishments: { min: -2, max: -4 },
        rewards: { min: 10, max: 25 },
      }
    );
  }
};
