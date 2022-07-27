import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import glob from "glob";
import path from "path";

const logger: typeof Logger = require("./logger")(__filename);

let client: JaneClient;

// const intent = Discord.GatewayIntentBits.FLAGS
// import hgd from '../Utils/hgdUtils'

// import registerHgdCommands from './HgdCmdReg'

export class JaneClient extends Client {
    commands: Collection<string, CommandBuilder>;
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
        logger.info(`Loading ${commands.length} commands (normal)`);

        for (const commandPath of commands) {
            const _CommandBuilder: { command: typeof CommandExport } =
                await import(commandPath);
            try {
                const command = new _CommandBuilder.command();
                this.commands.set(command.options.command, command);
            } catch (e) {
                logger.error(`Cannot create "File" for ${commandPath}`);
                logger.error(e);
            }
        }

        // const hgdCommands = registerHgdCommands(this)
        // logger.info(`Loading ${hgdCommands.length} commands (Hgd)`)
        // for (const command of hgdCommands) {
        // this.commands.set(command.name, command)
        // }

        logger.info(`Finished loading ${this.commands.size} commands`);

        return this.commands;
    }

    async registerEvents() {
        let eventsPath = path.resolve("./events/**/*.js");
        if (process.platform === "win32")
            eventsPath = eventsPath.replace(/\\/g, "/");
        const events = glob.sync(eventsPath);
        logger.info(`Loading ${events.length} events...`);

        let i = 0;

        for (const event of events) {
            const _EventBuilder: { event: typeof EventExport } = await import(
                event
            );
            const evt: EventBuilder = new _EventBuilder.event();
            logger.warn(JSON.stringify(evt));

            this.on(evt.eventName, (...args) => {
                logger.warn(args);
                evt.callback(client, ...args);
            });

            i++;
        }

        logger.info(
            `Now listening to the following ${i} events:\n${this.eventNames().join(
                " "
            )}`
        );
    }

    async logIn(startInDev = false) {
        if (startInDev) this.prefix = "--";
        this.registerCommands();
        this.registerEvents();
        // await hgd.connectClient()
        // logger.info('MongoDB Client connected!')
        this.login(startInDev ? process.env.DEVTOKEN : process.env.TOKEN);
        return this;
    }

    static getClient(forceReturn?: false): JaneClient | null;
    static getClient(forceReturn?: true): JaneClient;
    static getClient(forceReturn: boolean = false) {
        return client ? client : forceReturn ? new JaneClient() : null;
    }
}

export async function startClient(
    startInDev: boolean = false
): Promise<JaneClient> {
    client = await new JaneClient().logIn(startInDev);
    return client;
}
