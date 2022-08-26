import {
    Attachment,
    ActionRow,
    APIInteractionGuildMember,
    Client,
    Collection,
    ChatInputCommandInteraction,
    Embed,
    Guild,
    GuildMember,
    Message,
    MessageActionRowComponent,
    MessageInteraction,
    MessageType,
    ReactionManager,
    Snowflake,
    Sticker,
    TextBasedChannel,
    User,
    CacheType,
    MessagePayload,
    InteractionReplyOptions,
    ReplyMessageOptions,
    RESTPostAPIApplicationCommandsJSONBody,
    ColorResolvable,
    ButtonInteraction,
} from "discord.js";
import {
    SchoolDay,
    SpecialSchoolDay,
    UnspecifiedTimetableDay,
} from "../core/classes/dayTypes";
import { UserLevelData } from "../core/classes/hgd/leveldata";
import { User as dbUser } from "../core/classes/database";
import * as Enum from "./enums";

declare global {
    /* util types */
    type AnyCase<T extends string> = string extends T
        ? string
        : T extends `${infer F1}${infer F2}${infer R}`
        ? `${Uppercase<F1> | Lowercase<F1>}${
              | Uppercase<F2>
              | Lowercase<F2>}${AnyCase<R>}`
        : T extends `${infer F}${infer R}`
        ? `${Uppercase<F> | Lowercase<F>}${AnyCase<R>}`
        : "";
    type valueOf<T> = T[keyof T];
    type Common<A, B> = Pick<A | B, keyof A & keyof B>;

    class JaneLogger {
        label: string;
        constructor(filename: string);
        info(...message: any[]): void;
        warn(...message: any[]): void;
        error(...message: any[]): void;
        fatal(...message: any[]): void;
        static print(level: Level, label: string, ...message: any[]): void;
    }

    class JaneClient extends Client {
        commands: Collection<string, CommandBuilder>;
        hgdCommandConfigList: HgdActionConfig[];
        prefix: "-" | "--";

        constructor();
        registerCommands(): Promise<Collection<string, CommandBuilder>>;
        registerEvents(): Promise<void>;
        logIn(startInDev: boolean = false): Promise<JaneClient>;
        registerHgdActionConfig(config: HgdActionConfig): void;
        static getClient(forceReturn?: false): JaneClient | null;
        static getClient(forceReturn?: true): JaneClient;
        static getClient(forceReturn: boolean = false);
    }

    interface JaneEphemeralSupport {
        ephemeral?: boolean;
    }

    interface CommandInitiator<
        T extends ChatInputCommandInteraction | Message | ButtonInteraction =
            | ChatInputCommandInteraction
            | Message
            | ButtonInteraction
    > {
        readonly client: Client;
        readonly createdAt: Date;
        readonly createdTimestamp: number;
        readonly guild?: Guild | null;
        readonly member?: GuildMember | APIInteractionGuildMember | null;
        readonly token?: string | null;
        readonly url?: string | null;
        readonly initiatorType:
            | "CommandInteraction"
            | "Message"
            | "ButtonInteraction";
        readonly initiator: T;
        attachments: Collection<Snowflake, Attachment>;
        user: User;
        channel: TextBasedChannel | null;
        channelId: Snowflake;
        components: Array<ActionRow<MessageActionRowComponent>>;
        content?: string;
        deferred: boolean;
        ephemeral?: boolean | null;
        embeds: Array<Embed>;
        guildId?: Snowflake;
        id: Snowflake;
        replyInteraction?: MessageInteraction;
        pinned?: boolean;
        reactions?: ReactionManager;
        replied: boolean;
        stickers: Collection<Snowflake, Sticker>;
        type?: MessageType;

        fetchReply(): Promise<Message | undefined>;
        reply(
            options:
                | string
                | MessagePayload
                | Common<ReplyMessageOptions, InteractionReplyOptions>
        ): Promise<Message>;
        followUp(
            options:
                | string
                | MessagePayload
                | Common<ReplyMessageOptions, InteractionReplyOptions>
        ): Promise<Message>;
        strictReply(
            options: (
                | string
                | MessagePayload
                | Common<ReplyMessageOptions, InteractionReplyOptions>
            ) &
                JaneEphemeralSupport
        ): Promise<Message>;
    }

    class CommandBuilder<
        T extends ChatInputCommandInteraction | Message | ButtonInteraction =
            | ChatInputCommandInteraction
            | Message
            | ButtonInteraction
    > {
        options: CommandOptions;
        callback: CommandCallback<T>;

        constructor(ops: CommandOptions, callback: CommandCallback<T>);

        get client(): JaneClient;

        get slashCommandData(): RESTPostAPIApplicationCommandsJSONBody;
    }

    class EventBuilder {
        eventName: string;
        callback: EventCallback;
        constructor(eventName: string, callback: EventCallback);

        get client(): JaneClient;
    }

    class CommandExport extends CommandBuilder {
        constructor();
    }

    class EventExport extends EventBuilder {
        constructor();
    }

    declare interface CommandOptions {
        name?: string;
        command: string;
        aliases?: any[];
        category?: string;
        description?: string;
        usage?: string;
        cooldown?: number;
        minArgs?: number;
        maxArgs?: number;
        devOnly?: boolean;
        authorPermission?: PermissionResolvable[];
        clientPermission?: PermissionResolvable[];
        messageOnly?: boolean;
        slashOnly?: boolean;
        args?: CommandArgument[];
        initialDefer?: boolean;
    }

    declare interface CommandArgument {
        name: string;
        type:
            | "boolean"
            | "channel"
            | "integer"
            | "mentionable"
            | "number"
            | "role"
            | "string"
            | "user";
        description: string;
        required: boolean;
    }

    type CommandCallback<
        T extends ChatInputCommandInteraction | Message | ButtonInteraction
    > = (
        client: JaneClient,
        initiator: CommandInitiator<T>,
        ...args: any[]
    ) => Promise<string | void>;
    type EventCallback = (client: JaneClient, ...args: any[]) => Promise<void>;

    interface JaneErrorData {
        displayMessage?: string;
    }

    interface JaneErrorOptions {
        message: string;
        code?: string;
        id?: number;
    }

    interface JaneEmbedBuilderOptions {
        color?: ColorResolvable;
        titlePrefix?: string;
        titleSuffix?: string;
        contentPrefix?: string;
        contentSuffix?: string;
        showAuthor?: boolean;
        showTimestamp?: boolean;
        showBotFooter?: boolean;
        authorPrefix?: string;
        authorSuffix?: string;
    }

    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            DEVTOKEN: string;
            MONGO_URI: string;
            ID: string;
            DEVID: string;
        }
    }

    interface newsSearchResult {
        mediaName: string;
        priority: number;
        title: string;
        link: string;
        description: string;
        time: number;
    }

    interface DatabaseUserData {
        _id: any;
        snowflake: string;
        tag: string;
        avatarURL: string;
        sClass: ClassId;
        sCNum: number;
        sID: string;
        sName: string;
        hgd: number;
        shards: number;
        highLvLocked: boolean;

        afternoonTeaCount: number;
        gardeningCount: number;
        filesCount: number;
        morningCount: number;
        nightCount: number;
        patCount: number;
        roseCount: number;
        roseTeaCount: number;
        teeTeeCount: number;

        lastAfternoonTea: number;
        lastFiles: number;
        lastGardening: number;
        lastMorning: number;
        lastNight: number;
        lastPat: number;
        lastRose: number;
        lastRoseTea: number;
        lastTeeTee: number;
    }

    /**
     * Type of Keys of camel hgd actions
     */
    type CamelHgdActionKT = keyof typeof Enum.CamelHgdActions;

    /**
     * Type of Values of pascal hgd actions
     */
    type PascalHgdActionVT =
        | "AfternoonTea"
        | "Gardening"
        | "Files"
        | "Morning"
        | "Night"
        | "Pat"
        | "Rose"
        | "RoseTea"
        | "TeeTee";

    interface HgdData {
        hgd: number;
        shards: number;
        highLvLocked: boolean;

        actionCounts?: HgdActionCounts;
        actionRecords?: HgdActionRecords;

        getRank: () => Promise<number | "?">;
        levelData: UserLevelData;

        actionAvailabilities: HgdActionAvailability[];
    }

    interface HgdActionAvailability {
        action: Enum.CamelHgdActions;
        actionConfig: HgdActionConfig;
        available: boolean;
    }

    interface LevelConfig {
        level: number;
        upperLimit: number;
        lowerLimit: number;
        shardPerc: number;
        shardRange: [number, number];
    }

    interface HgdActionConfig {
        /**
         * Cooldown in minutes
         */
        emoji: { numericId: `${number}`; fullId: string; name?: string };
        commandName: string;
        commandCode: Enum.CamelHgdActions;
        coolDown?: number;
        lvRequirement?: number;
        timeCondition?: {
            after: `${string}:${string}`;
            before: `${string}:${string}`;
        };
        dayCondition?: { in: number[] } | { notIn: number[] };
        rewards: { min: number; max: number };
        punishments: { min: number; max: number };
        texts: HgdCommandTexts;
        runCode: Enum.JaneHgdButtonRunCode;
    }

    interface HgdCommandTexts {
        ACTION_NAME: any[];
        ACTION_MESSAGE: any[];
        DAY_CONDITION_MISMATCH?: any[];
        TIME_CONDITION_MISMATCH?: any[];
        SUCCESS_ACTION_MESSAGE: any[];
        FAILURE_ACTION_MESSAGE: any[];
        SUCCESS_FOOTER_MESSAGE: any[];
    }

    type HgdActionCounts = {
        [action in CamelHgdActionKT]: number;
    };

    type HgdActionRecords = {
        [action in PascalHgdActionVT]: number;
    };

    type ClassId = `${number}${string}`;

    interface TimetableDay {
        readonly type: SchoolDayType;
    }
    [];

    type SchoolDayTypes = SchoolDay | SpecialSchoolDay;
    type HolidayTypes = Holiday | UnspecifiedTimetableDay;

    type months =
        | "JAN"
        | "FEB"
        | "MAR"
        | "APR"
        | "MAY"
        | "JUN"
        | "JUL"
        | "AUG"
        | "SEP"
        | "OCT"
        | "NOV"
        | "DEC";
    type TimetableDateResolvable =
        | `${string}mr`
        | `${number}${"/" | "-" | "_" | "\\"}${number}`
        | `${number}${"/" | "-" | "_" | ""}${string}`
        | `${number}${string}`
        | `${number}d`
        | `${"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"}${string}`;

    /**
     * Custom Id Format for Jane's Interaction: `(enum)JaneInteractionType`-`(enum)JaneInteractionGroup`-`k`-`v`
     */
    type JaneInteractionId =
        `J-${Enum.JaneInteractionType}-${Enum.JaneInteractionGroup}-${string}-${string}`;
}
