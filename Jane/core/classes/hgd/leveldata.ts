import levelsConfig from "../../../data/config/hgdLevels.json";
import emojis from "../../../data/config/emojis.json";

/**
 * Make number 0 if it's negative
 * @param n Number input
 * @returns Number output
 */
const pos = (n: number) => (n < 0 ? 0 : n);

export class UserLevelData {
  level: number;
  percentage: number;
  progressBar: string;
  levelConfig: LevelConfig;

  constructor(hgd: number) {
    for (let i = 0; i < levelsConfig.length; i++) {
      const { level, lowerLimit, upperLimit } = levelsConfig[i];
      if (hgd >= lowerLimit && hgd < upperLimit) {
        this.level = level;
        this.levelConfig = levelsConfig[i] as LevelConfig;
        break;
      }
    }
    this.level ??= 0;
    this.levelConfig ??= levelsConfig[0] as LevelConfig;

    this.percentage =
      100 *
      ((hgd - pos(this.levelConfig.lowerLimit)) /
        (this.levelConfig.upperLimit - pos(this.levelConfig.lowerLimit)));

    const stage = Math.floor(this.percentage / 10);

    this.progressBar = `${
      stage <= 0 ? emojis.EMPTY.LEFT : emojis.FILLED.LEFT
    }${emojis.FILLED.MID.repeat(pos(stage - 1))}${emojis.EMPTY.MID.repeat(
      pos(9 - stage)
    )}${stage >= 10 ? emojis.FILLED.RIGHT : emojis.EMPTY.RIGHT}`;
  }
}
