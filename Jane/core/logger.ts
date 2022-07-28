import path from "path";
import { colorCodes } from "../utils/colorCodes";
import { Utilities } from "../utils/utility-functions";

interface Level {
    color1: string;
    color2: string;
    levelname: "INFO" | "WARN" | "ERROR" | "FATAL";
}
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

class Logger {
    label: string;

    constructor(filename: string) {
        this.label = path.basename(filename);
    }

    info(...message: string[]) {
        Logger._print(levels.INFO, this.label, ...message);
    }

    warn(...message: string[]) {
        Logger._print(levels.WARN, this.label, ...message);
    }

    error(...message: string[]) {
        Logger._print(levels.ERROR, this.label, ...message);
    }

    fatal(...message: string[]) {
        Logger._print(levels.FATAL, this.label, ...message);
    }

    static _print(level: Level, label: string, ...message: string[]) {
        const outputMessage = message.join(" ");

        const date = new Date();
        const time = Utilities.formatTimeString(date, "HH:mm:ss.ms");

        const { color1, color2, levelname } = level;
        const reset = colorCodes.reset;
        return console.log(
            `${reset}${time} ${color1}${levelname}${reset}` +
                ` - ${color2}${label}${reset} > ${color2}${outputMessage}${reset}`
        );
    }
}

module.exports = function initLogger(filename: string): JaneLogger {
    return new Logger(filename);
};
