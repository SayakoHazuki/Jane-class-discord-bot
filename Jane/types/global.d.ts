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
    ApplicationCommandChoicesOption,
    APIApplicationCommandOptionChoice,
    PermissionResolvable,
} from "discord.js";
import {
    Holiday,
    SchoolDay,
    SpecialSchoolDay,
    UnspecifiedTimetableDay,
} from "../core/classes/dayTypes";
import { UserLevelData } from "../core/classes/hgd/leveldata";
import { User as dbUser } from "../core/classes/database";
import * as Enum from "./enums";
import { Cache } from "../core/cacheSystem";
import { JaneClient } from "../core/client";
import { Logger } from "../core/logger";
import { CommandBuilder } from "../core/commandBuilder";
import { EventBuilder } from "../core/eventBuilder";
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

    interface Level {
        color1: string;
        color2: string;
        levelname: "INFO" | "WARN" | "ERROR" | "FATAL";
    }

    type JaneLoggerT = Logger;

    type JaneClientT = JaneClient;

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

    type CommandBuilderT = CommandBuilder;

    type EventBuilderT = EventBuilder;

    class CommandExport extends CommandBuilder {
        constructor();
    }

    class EventExport extends EventBuilder {
        constructor();
    }

    interface CommandOptions {
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

    interface CommandArgument {
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
        choices?: APIApplicationCommandOptionChoice<string>[];
    }

    type CommandCallback<
        T extends ChatInputCommandInteraction | Message | ButtonInteraction
    > = (
        client: JaneClientT,
        initiator: CommandInitiator<T>,
        ...args: any[]
    ) => Promise<string | void>;
    type EventCallback = (client: JaneClientT, ...args: any[]) => Promise<void>;

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
            PYCA: string;
            PYCB: string;
            BOTID: string;
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
        readonly type: Enum.SchoolDayType;
    }

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

    interface TimetableOptions {
        editMessage?: boolean;
        message?: Message;
    }

    /**
     * Custom Id Format for Jane's Interaction: `(enum)JaneInteractionType`-`(enum)JaneInteractionGroup`-`k`-`v`
     */
    type JaneInteractionId<
        k extends string | number | boolean | null | undefined = string,
        v extends string | number | boolean | null | undefined = string
    > = `J-${Enum.JaneInteractionType}-${Enum.JaneInteractionGroup}-${k}-${v}`;
}
