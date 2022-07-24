import { Client, GatewayIntentBits, Collection, TextChannel } from "discord.js";
import glob from "glob";
import path from "path";
import Command from "./command";

let client: JaneClient;

// const intent = Discord.GatewayIntentBits.FLAGS
// import hgd from '../Utils/hgdUtils'

// import registerHgdCommands from './HgdCmdReg'

export default class JaneClient extends Client {
    commands: Collection<string, Command>;
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
            ],
        });
        this.commands = new Collection();
        this.prefix = "-";
    }

    // setPlr(player) {
    //     this.player = player
    // }

    registerCommands() {
        const commands = glob.sync(path.resolve("commands/**/*.js"));
        // logger.info(`Loading ${commands.length} commands (normal)`)

        for (const commandPath of commands) {
            const File = require(commandPath);
            let cmd;
            try {
                cmd = new File(this);
            } catch (e) {
                // logger.error(`Cannot create "File" for ${commandPath}`)
                stopFile();
            }
            function stopFile() {
                throw new Error("Stop registering Commands");
            }

            this.commands.set(cmd.name, cmd);
        }

        // const hgdCommands = registerHgdCommands(this)
        // logger.info(`Loading ${hgdCommands.length} commands (Hgd)`)
        // for (const command of hgdCommands) {
        // this.commands.set(command.name, command)
        // }

        // logger.info(`Finished loading ${this.commands.size} commands`)

        return this.commands;
    }

    registerEvents() {
        const events = glob.sync(path.resolve("./../Jane/events/*.js"));
        // logger.info(`Loading ${events.length} events...`)

        let i = 0;

        for (const event of events) {
            const File = require(event);
            const evt = new File(this);

            this.on(evt.name, (...args) => {
                evt.run(...args);
            });

            i++;
        }

        // logger.info(
        //     `Now listening to the following ${i} events:\n${this.eventNames().join(
        //         ' '
        //     )}`
        // )
    }

    async logIn(startInDev = false) {
        if (startInDev) this.prefix = "--";
        this.registerCommands();
        this.registerEvents();
        // await hgd.connectClient()
        // logger.info('MongoDB Client connected!')
        this.login(startInDev ? process.env.DEVTOKEN : process.env.TOKEN);
    }

    static getClient(forceReturn: false): JaneClient | null;
    static getClient(forceReturn: true): JaneClient;
    static getClient(forceReturn: boolean) {
        return client ? client : forceReturn ? new JaneClient() : null;
    }
}
