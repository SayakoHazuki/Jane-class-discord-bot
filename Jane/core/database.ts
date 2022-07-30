import { Snowflake } from "discord.js";
import { MongoClient, Sort, WithId } from "mongodb";

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
        return globalDbClient;
    }

    static getClient() {
        return globalDbClient;
    }

    static async getUser(discordId: Snowflake) {
        const query = { snowflake: discordId };
        const options = {
            sort: <Sort>{ _id: -1 },
        };
        const data = (await Database.collection.findOne(
            query,
            options
        )) as WithId<DatabaseUserData> | null;
        logger.info(JSON.stringify(data));
        if (!data)
            throw <ErrorMessage>{
                message: "Userdata is null",
                code: "NULL_DB_USERDATA",
                id: 501,
            };
        return new User(data);
    }

    static get collection() {
        const database = globalDbClient.db("jane");
        const collection = database.collection("hgdv2");
        return collection;
    }
}

class User {
    discordId: string;
    discordTag: string;
    discordAvatarURL: string;

    studentClass: number;
    studentClassNumber: string;
    studentId: string;
    studentName: string;

    hgd: number;
    shards: number;
    highLvLocked: boolean;

    actionCounts: HgdActionCounts;
    actionRecords: HgdActionRecords;

    constructor(userdata: DatabaseUserData) {
        this.discordId = userdata.snowflake;
        this.discordTag = userdata.tag;
        this.discordAvatarURL = userdata.avatarURL;

        this.studentClass = userdata.sClass;
        this.studentClassNumber = userdata.sCNum;
        this.studentId = userdata.sID;
        this.studentName = userdata.sName;

        this.hgd = userdata.hgd;
        this.shards = userdata.shards;
        this.highLvLocked = userdata.highLvLocked;

        this.actionCounts = {};
        this.actionRecords = {};
        for (const action of hgdActions) {
            this.actionCounts[action] = <number>userdata[`${action}Count`];
        }
        for (const action of upperHgdActions) {
            this.actionRecords[action] = <number>userdata[`last${action}`];
        }
    }
}
