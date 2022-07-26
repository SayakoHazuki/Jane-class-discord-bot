import * as Discord from "discord.js";

declare global {
    class JaneClient extends Discord.Client {
        commands: Discord.Collection<string, CommandBuilder>;
        prefix: "-" | "--";

        constructor();
        registerCommands(): Promise<Discord.Collection<string, CommandBuilder>>;
        registerEvents(): Promise<void>;
        logIn(startInDev: boolean = false): Promise<JaneClient>;
        static getClient(forceReturn?: false): JaneClient | null;
        static getClient(forceReturn?: true): JaneClient;
        static getClient(forceReturn: boolean = false);
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
        authorPermission?: Discord.PermissionResolvable[];
        clientPermission?: Discord.PermissionResolvable[];
        messageOnly?: boolean;
    }

    type CommandCallback = (
        client: JaneClient,
        initiator: Discord.Message | Discord.CommandInteraction,
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
