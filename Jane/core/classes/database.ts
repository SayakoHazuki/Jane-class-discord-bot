import { Message, Snowflake } from "discord.js";
import { MongoClient, Sort, WithId } from "mongodb";
import { ErrorCode, PascalHgdActions } from "../../types/enums";
import { formatTimeString } from "../../utils/utility-functions";
import { JaneClient } from "../client";
import { initLogger } from "../logger";
import { JaneDatabaseError, JaneGeneralError } from "./errors";
import { UserLevelData } from "./hgd/leveldata";

const Logger = initLogger(__filename);

let globalDbClient: MongoClient;

const hgdActions = [
  ...["afternoonTea", "gardening", "files"],
  ...["morning", "night", "pat"],
  ...["rose", "roseTea", "teeTee"],
] as (
  | "afternoonTea"
  | "gardening"
  | "files"
  | "morning"
  | "night"
  | "pat"
  | "rose"
  | "roseTea"
  | "teeTee"
)[];

const upperHgdActions = <
  (
    | "AfternoonTea"
    | "Gardening"
    | "Files"
    | "Morning"
    | "Night"
    | "Pat"
    | "Rose"
    | "RoseTea"
    | "TeeTee"
  )[]
>hgdActions.map((a) => a.charAt(0).toUpperCase() + a.substring(1, a.length));

export class Database {
  constructor() {}

  static async connect() {
    globalDbClient = new MongoClient(process.env.MONGO_URI);
    await globalDbClient.connect();
    Logger.info("Connected to MongoDB");
    return globalDbClient;
  }

  static getClient() {
    return globalDbClient;
  }

  static async getUser(discordId: Snowflake) {
    Logger.error(discordId);
    const query = { snowflake: discordId };
    const options = {
      sort: <Sort>{ _id: -1 },
    };
    const data = (await Database.collection.findOne(
      query,
      options
    )) as WithId<DatabaseUserData> | null;
    Logger.info(JSON.stringify(data));
    if (!data)
      throw new JaneDatabaseError("Userdata is null", ErrorCode.NULL_USER_DATA);
    return new User(data);
  }

  static async updateUser(dcid: string, updateJson: Partial<DatabaseUserData>) {
    const filter = { snowflake: dcid };
    const updateDocument = {
      $set: updateJson,
    };

    await Database.collection.updateOne(filter, updateDocument);
    return updateJson;
  }

  static get collection() {
    const database = globalDbClient.db("jane");
    const collection = database.collection("hgdv2");
    return collection;
  }

  static get db() {
    return globalDbClient;
  }
}

export class User {
  json: Partial<DatabaseUserData>;
  private updateJson: Partial<DatabaseUserData>;

  discordId?: string;
  discordTag?: string;
  discordAvatarURL?: string;

  studentClass?: ClassId;
  studentClassNumber?: number;
  studentId?: string;
  studentName?: string;

  hgdData?: HgdData;

  constructor(userdata: Partial<DatabaseUserData>) {
    this.json = userdata;
    this.updateJson = {};

    this.discordId = userdata.snowflake;
    this.discordTag = userdata.tag;
    this.discordAvatarURL = userdata.avatarURL;

    this.studentClass = userdata.sClass;
    this.studentClassNumber = userdata.sCNum;
    this.studentId = userdata.sID;
    this.studentName = userdata.sName;

    // this.hgd = new HgdManager(userdata.snowflake);
    const hgdActionRecords = (() => {
      let r = {} as HgdActionRecords;
      for (const action of upperHgdActions) {
        r[action] = Number(userdata[`last${action}`]) as number;
      }
      return r;
    })();

    this.hgdData = {
      hgd: userdata.hgd ?? 0,
      shards: userdata.shards ?? 0,
      highLvLocked: userdata.highLvLocked ?? true,
      actionCounts: (() => {
        let r = {} as HgdActionCounts;
        for (const action of hgdActions) {
          r[action] = <number>userdata[`${action}Count`];
        }
        return r;
      })(),
      actionRecords: hgdActionRecords,
      getRank: async function () {
        const dbResults = await Database.collection
          .find()
          .sort({ hgd: -1 })
          .toArray();
        let r = dbResults.map((i) => i.snowflake).indexOf(userdata.snowflake);
        if (r == undefined || isNaN(r)) {
          return "?";
        }
        return ++r;
      },
      levelData: new UserLevelData(userdata.hgd ?? 0),
      actionAvailabilities: (() => {
        const actionAvailabilities: HgdActionAvailability[] = [];
        for (const config of (JaneClient.getClient() as JaneClient)
          .hgdCommandConfigList) {
          let available = true;
          if (config.lvRequirement !== undefined) {
            const userLevel = new UserLevelData(userdata.hgd ?? 0).level;
            if (!(userLevel >= config.lvRequirement)) {
              available = false;
            }
          }

          if (config.dayCondition !== undefined) {
            const currentDayOfWeek = new Date().getDay();
            let dayConditionPass = true;
            if ("in" in config.dayCondition) {
              dayConditionPass =
                config.dayCondition.in.includes(currentDayOfWeek);
            } else {
              dayConditionPass =
                !config.dayCondition.notIn.includes(currentDayOfWeek);
            }

            if (!dayConditionPass) {
              available = false;
            }
          }

          if (config.timeCondition !== undefined) {
            const current = new Date();
            const currentTimeString = `${formatTimeString(current, "HH:mm")}`;

            let timeConditionPass = true;
            if (config.timeCondition.after > config.timeCondition.before) {
              timeConditionPass =
                (currentTimeString >= config.timeCondition.after &&
                  currentTimeString <= "23:59") ||
                (currentTimeString <= config.timeCondition.before &&
                  currentTimeString >= "00:00");
            } else {
              timeConditionPass =
                currentTimeString >= config.timeCondition.after &&
                currentTimeString <= config.timeCondition.before;
            }

            if (!timeConditionPass) {
              available = false;
            }
          }

          let diffPass = true;
          if (config.coolDown !== undefined) {
            const lastRunTimestamp =
              hgdActionRecords[PascalHgdActions[config.commandCode]];
            const currentTimestamp = Math.floor(new Date().getTime() / 1000);
            const differenceInMins = (currentTimestamp - lastRunTimestamp) / 60;
            if (config.coolDown > differenceInMins) {
              diffPass = false;
            }
          }

          if (!diffPass) available = false;
          actionAvailabilities.push({
            action: config.commandCode,
            actionConfig: config,
            available: available,
          });
        }
        return actionAvailabilities;
      })(), // to be completed
    };
  }

  commitUpdate(k: keyof DatabaseUserData, v: any) {
    this.updateJson[k] = v;
  }

  async pushUpdates() {
    if (!this.discordId)
      throw new JaneGeneralError(
        "DBUser's discordId cannot be undefined when pushing updates.",
        ErrorCode.UNEXPECTED_TYPE
      );
    const data = await Database.updateUser(
      this.discordId,
      this.committedUpdatesJson
    );
    return new User(data);
  }

  get committedUpdatesJson() {
    return { ...this.json, ...this.updateJson };
  }
}
