type Message = import("discord.js").Message;
type CommandInteraction = import("discord.js").CommandInteraction;

declare interface CommandOptions {
    name: string;
    aliases?: string[];
    category?: string;
    description?: string;
    usage?: string;
    cooldown?: number;
    minArgs?: number;
    maxArgs?: number;
    devOnly?: boolean;
    authorPermission?: unknown;
    clientPermission?: unknown;
    messageOnly?: boolean;
}

type CommandCallback = (
    initiator: Message | CommandInteraction,
    ...args: string[]
) => Promise<string | void>;
type EventCallback = (args: any[]) => Promise<void>;

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
