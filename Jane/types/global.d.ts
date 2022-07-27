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
} from "discord.js";

declare global {
    class JaneClient extends Client {
        commands: Collection<string, CommandBuilder>;
        prefix: "-" | "--";

        constructor();
        registerCommands(): Promise<Collection<string, CommandBuilder>>;
        registerEvents(): Promise<void>;
        logIn(startInDev: boolean = false): Promise<JaneClient>;
        static getClient(forceReturn?: false): JaneClient | null;
        static getClient(forceReturn?: true): JaneClient;
        static getClient(forceReturn: boolean = false);
    }

    interface CommandInitiator {
        readonly client: Client;
        readonly createdAt: Date;
        readonly createdTimestamp: number;
        readonly guild?: Guild | null;
        readonly member?: GuildMember | APIInteractionGuildMember | null;
        readonly token?: string | null;
        readonly url?: string | null;
        readonly initiatorType: "CommandInteraction" | "Message";
        readonly initiator: ChatInputCommandInteraction | Message;
        attachments: Collection<Snowflake, Attachment>;
        user?: User;
        channel: TextBasedChannel | null;
        channelId: Snowflake;
        components: Array<ActionRow<MessageActionRowComponent>>;
        content?: string;
        deferred: boolean;
        ephemeral?: boolean;
        embeds: Array<Embed>;
        guildId?: Snowflake;
        id: Snowflake;
        replyInteraction?: MessageInteraction;
        pinned?: boolean;
        reactions?: ReactionManager;
        replied: boolean;
        stickers: Collection<Snowflake, Sticker>;
        type?: MessageType;

        fetchReply(): Promise<Message|undefined>;
        reply(
            options:
                | string
                | MessagePayload
        ): Promise<Message>;
        followUp(
            options:
                | string
                | MessagePayload
        ): Promise<Message>;
    }

    class CommandBuilder {
        options: CommandOptions;
        callback: CommandCallback;

        constructor(ops: CommandOptions, callback: CommandCallback);

        get client(): JaneClient;
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
        aliases?: string[];
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
    }

    type CommandCallback = (
        client: JaneClient,
        initiator: CommandInitiator,
        ...args: string[]
    ) => Promise<string | void>;
    type EventCallback = (client: JaneClient, ...args: any[]) => Promise<void>;

    declare interface ErrorMessage {
        message: string;
        code?: string;
        id?: number;
    }

    type JaneEmbedBuilderOptions = {
        color: string = Consts.themeColor;
        titlePrefix: string = "";
        titleSuffix: string = "";
        contentPrefix: string = "";
        contentSuffix: string = "";
        showAuthor: boolean = false;
        showTimestamp: boolean = false;
        showBotFooter: boolean = false;
    };

    class Logger {
        label: string;
        constructor(filename: string);
        info(...message: string[]): void;
        warn(...message: string[]): void;
        error(...message: string[]): void;
        fatal(...message: string[]): void;
        static print(level: Level, label: string, ...message: string[]): void;
    }
}
