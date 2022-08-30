import * as dotenv from "dotenv";
dotenv.config();
import {
    Client,
    GatewayIntentBits,
    Collection,
    Partials,
    Routes,
} from "discord.js";
import { REST } from "@discordjs/rest";
import glob from "glob";
import path from "path";
import { Consts } from "./consts";
import { initLogger } from "./logger";
import { Database } from "./classes/database";
import { MongoClient } from "mongodb";
import { Cache } from "./cacheSystem";

const Logger = initLogger(__filename);

let client: JaneClient;

// const intent = Discord.GatewayIntentBits.FLAGS
// import hgd from '../Utils/hgdUtils'

// import registerHgdCommands from './HgdCmdReg'

export class JaneClient extends Client {
    commands: Collection<string, CommandBuilder>;
    hgdCommandConfigList: HgdActionConfig[];
    prefix: "-" | "--";

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Channel],
        });
        this.commands = new Collection();
        this.hgdCommandConfigList = [];
        this.prefix = "-";
    }

    // setPlr(player) {
    //     this.player = player
    // }

    async registerCommands() {
        let commandsPath = path.resolve("./commands/**/*.js");
        if (process.platform === "win32")
            commandsPath = commandsPath.replace(/\\/g, "/");
        const commands = glob.sync(commandsPath);
        Logger.info(`Loading ${commands.length} commands (normal)`);

        for (const commandPath of commands) {
            const _CommandBuilder: { command: typeof CommandExport } =
                await import(commandPath);
            try {
                const command = new _CommandBuilder.command();
                this.commands.set(command.options.command, command);
            } catch (e: any) {
                Logger.error(`Cannot create "File" for ${commandPath}`);
                Logger.error(e?.stack || "");
            }
        }

        // const hgdCommands = registerHgdCommands(this)
        // Logger.info(`Loading ${hgdCommands.length} commands (Hgd)`)
        // for (const command of hgdCommands) {
        // this.commands.set(command.name, command)
        // }

        const rest = new REST({ version: "10" }).setToken(process.env.DEVTOKEN);

        try {
            console.log("Started refreshing application (/) commands.");

            await rest.put(Routes.applicationCommands(process.env.DEVID), {
                body: Array.from(
                    this.commands
                        .filter((command) => !command.options.messageOnly)
                        .map((command) => command.slashCommandData)
                        .values()
                ),
            });

            console.log("Successfully reloaded application (/) commands.");
        } catch (error) {
            console.error(error);
        }

        Logger.info(`Finished loading ${this.commands.size} commands`);

        return this.commands;
    }

    async registerEvents() {
        let eventsPath = path.resolve("./events/**/*.js");
        if (process.platform === "win32")
            eventsPath = eventsPath.replace(/\\/g, "/");
        const events = glob.sync(eventsPath);
        Logger.info(`Loading ${events.length} events...`);

        let i = 0;

        for (const event of events) {
            const _EventBuilder: { event: typeof EventExport } = await import(
                event
            );
            const evt: EventBuilder = new _EventBuilder.event();

            this.on(evt.eventName, (...args) => {
                evt.callback(client, ...args);
            });

            i++;
        }

        Logger.info(
            `Now listening to the following ${i} events:\n${this.eventNames().join(
                " "
            )}`
        );
    }

    async logIn(startInDev = false) {
        if (startInDev) this.prefix = "--";
        await this.registerCommands();
        await this.registerEvents();
        // await hgd.connectClient()
        // Logger.info('MongoDB Client connected!')
        await this.login(startInDev ? process.env.DEVTOKEN : process.env.TOKEN);
        return this;
    }

    registerHgdActionConfig(config: HgdActionConfig) {
        Logger.warn(`Added ${config.commandCode}`);
        this.hgdCommandConfigList.push(config);
    }

    static getClient(forceReturn?: false): JaneClient | null;
    static getClient(forceReturn?: true): JaneClient;
    static getClient(forceReturn: boolean = false) {
        return client ? client : forceReturn ? new JaneClient() : null;
    }

    get cache() {
        return Cache
    }
}

export async function startClient(
    startInDev: boolean = false
): Promise<JaneClient> {
    client = new JaneClient();
    client = await client.logIn(startInDev);
    const db = await Database.connect();
    return client;
}
