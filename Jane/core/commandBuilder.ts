import { JaneClient } from "./client";

export class CommandBuilder {
    options: CommandOptions;
    callback: CommandCallback;

    constructor(ops: CommandOptions, callback: CommandCallback) {
        this.options = {
            name: ops.name || ops.command,
            command: ops.command,
            aliases: ops.aliases || [],
            category: ops.category || "",
            description: ops.description || ops.command,
            usage: ops.usage || ops.command,
            cooldown: ops.cooldown ?? 0,
            minArgs: ops.minArgs ?? 0,
            maxArgs: ops.maxArgs ?? -1,
            devOnly: ops.devOnly ?? false,
            authorPermission: ops.authorPermission,
            clientPermission: ops.clientPermission,
            messageOnly: ops.messageOnly ?? false,
        };
        this.callback = callback;
    }

    get client() {
        return JaneClient.getClient() as JaneClient;
    }
}
