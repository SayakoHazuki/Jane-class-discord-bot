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
        texts: {
          ACTION_NAME: ["請簡喝花茶"],
          ACTION_MESSAGE: ["$dcUser.username 請了簡喝一杯玫瑰花茶"],
          SUCCESS_ACTION_MESSAGE: [
            "簡喜歡您給的玫瑰花茶",
            "簡很感謝您給簡的花茶",
          ],
          FAILURE_ACTION_MESSAGE: [
            "簡剛才喝過您給的花茶了",
            "簡還在喝您剛才給的花茶",
            "簡目前喝不下更多的花茶了!",
          ],
          SUCCESS_FOOTER_MESSAGE: ["喜歡喝花茶的簡"],
        },
        punishments: { min: -2, max: -4 },
        rewards: { min: 20, max: 40 },
        runCode: Enum.JaneHgdButtonRunCode.roseTea,
      }
    );
  }
};
