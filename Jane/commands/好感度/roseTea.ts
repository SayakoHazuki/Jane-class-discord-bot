import { HgdCommandBuilder } from "../../core/classes/hgd/hgdCommandBuilder";
import Emojis from "../../data/config/emojis.json";
import { initLogger } from "../../core/logger";
import * as Enum from "../../types/enums";

const Logger = initLogger(__filename);

export const command = class HgdRoseTeaCommand extends HgdCommandBuilder {
  constructor() {
    super(
      "請簡喝玫瑰花茶",
      [
        "請簡喝花茶",
        "請簡喝一杯玫瑰花茶",
        "請簡喝一杯花茶",
        "送給簡一杯玫瑰花茶",
        "送給簡一杯花茶",
        "給簡一杯玫瑰花茶",
        "給簡一杯花茶",
      ],
      {
        commandCode: Enum.CamelHgdActions.roseTea,
        commandName: "請簡喝玫瑰花茶",
        coolDown: 30,
        emoji: {
          fullId: Emojis.hgdActionEmojis.roseTea,
          name: Emojis.hgdActionEmojis.roseTea,
          numericId: "0",
        },
        messages: {
          ACTION_MESSAGE_1: ["test"],
          ACTION_MESSAGE_2: ["test"],
          DAY_CONDITION_MISMATCH: ["test"],
          TIME_CONDITION_MISMATCH: ["test"],
        },
        punishments: { min: -2, max: -4 },
        rewards: { min: 20, max: 40 },
      }
    );
  }
};
