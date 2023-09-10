import path from "path";
import { colorCodes } from "../utils/colorCodes";
import { formatTimeString } from "../utils/utility-functions";
import fs from "fs";

let logFile: string | null = null;

const levels: { [level: string]: Level } = {
    INFO: {
        color1: colorCodes.green.fg,
        color2: colorCodes.cyan.fg,
        levelname: "INFO",
    },
    WARN: {
        color1: colorCodes.yellow.fg,
        color2: colorCodes.yellow.fg,
        levelname: "WARN",
    },
    ERROR: {
        color1: colorCodes.red.fg,
        color2: colorCodes.red.fg,
        levelname: "ERROR",
    },
    FATAL: {
        color1: `${colorCodes.red.bg}${colorCodes.white.fg}`,
        color2: colorCodes.red.fg,
        levelname: "FATAL",
    },
};

export class Logger {
    label: string;

    constructor(filename: string) {
        this.label = path.basename(filename);
    }

    info(...message: any[]) {
        Logger._print(levels.INFO, this.label, ...message);
    }

    warn(...message: any[]) {
        Logger._print(levels.WARN, this.label, ...message);
    }

    error(...message: any[]) {
        Logger._print(levels.ERROR, this.label, ...message);
    }

    fatal(...message: any[]) {
        Logger._print(levels.FATAL, this.label, ...message);
    }

    static _print(level: Level, label: string, ...message: any[]) {
        const outputMessage = message.join(" ");

        const date = new Date();
        const time = formatTimeString(date, "HH:mm:ss.ms");

        const { color1, color2, levelname } = level;
        const reset = colorCodes.reset;

        const consoleText =
            `${reset}${time} ${color1}${levelname}${reset}` +
            ` - ${color2}${label}${reset} > ${color2}${outputMessage}${reset}`;

        const logText = `${time} ${levelname} - ${label} > ${outputMessage}`;

        console.log(consoleText);
        if (logFile) {
            fs.appendFileSync(logFile, logText + "\n");
        } else {
            console.warn("No log file specified!");
        }
    }
}

export function initLogger(filename: string): JaneLoggerT {
    return new Logger(filename);
}

export function initLogFile(): void {
    const date = new Date();
    const dateString = formatTimeString(date, "yyyy-MM-dd-HH-mm-ss");
    logFile = `logs/${dateString}.log`;
    fs.writeFileSync(logFile, "");
    Logger._print(levels.INFO, __filename, `Log file created: ${logFile}`);
}
