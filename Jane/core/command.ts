import JaneClient from "./client"

export default class Command {
    client: JaneClient;
    options: CommandOptions;
    callback: CommandCallback;

    constructor(client: JaneClient, ops: CommandOptions, callback: CommandCallback) {
        this.client = client
        this.options = {
            name: ops.name,
            aliases: ops.aliases || [],
            category: ops.category || "",
            description: ops.description || ops.name,
            usage: ops.usage || ops.name,
            cooldown: ops.cooldown ?? 0,
            minArgs: ops.minArgs ?? 0,
            maxArgs: ops.maxArgs ?? -1,
            devOnly: ops.devOnly ?? false,
            authorPermission: ops.authorPermission,
            clientPermission: ops.clientPermission,
            messageOnly: ops.messageOnly ?? false
        }
        this.callback = callback;
    }
}
