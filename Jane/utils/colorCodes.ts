const reset = "\x1b[0m";
const pBlack = "\x1b[30m";
const pRed = "\x1b[31m";
const pGreen = "\x1b[32m";
const pYellow = "\x1b[33m";
const pBlue = "\x1b[34m";
const pMagenta = "\x1b[35m";
const pCyan = "\x1b[36m";
const pWhite = "\x1b[37m";
const sBlack = "\x1b[40m";
const sRed = "\x1b[41m";
const sGreen = "\x1b[42m";
const sYellow = "\x1b[43m";
const sBlue = "\x1b[44m";
const sMagenta = "\x1b[45m";
const sCyan = "\x1b[46m";
const sWhite = "\x1b[47m";

/**
 * const bright = "\x1b[1m"
 * const dim = "\x1b[2m"
 * const underscore = "\x1b[4m"
 * const blink = "\x1b[5m"
 * const reverse = "\x1b[7m"
 * const hidden = "\x1b[8m"
 */

export default {
    reset: reset,
    red: {
        fg: pRed,
        bg: sRed,
    },
    yellow: {
        fg: pYellow,
        bg: sYellow,
    },
    green: {
        fg: pGreen,
        bg: sGreen,
    },
    blue: {
        fg: pBlue,
        bg: sBlue,
    },
    cyan: {
        fg: pCyan,
        bg: sCyan,
    },
    magenta: {
        fg: pMagenta,
        bg: sMagenta,
    },
    black: {
        fg: pBlack,
        bg: sBlack,
    },
    white: {
        fg: pWhite,
        bg: sWhite,
    },
};
