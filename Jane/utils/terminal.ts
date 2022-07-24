const path = require('path')
const getColor = require('./colorCode.js')
const formatter = require('./formatting.js')

const levels = {
  INFO: {
    color1: colorCodes.green.fg,
    color2: colorCodes.cyan.fg,
    levelname: 'INFO'
  },
  WARN: {
    color1: colorCodes.yellow.fg,
    color2: colorCodes.yellow.fg,
    levelname: 'WARN'
  },
  ERROR: {
    color1: colorCodes.red.fg,
    color2: colorCodes.red.fg,
    levelname: 'ERROR'
  },
  FATAL: {
    color1: `${colorCodes.red.bg}${colorCodes.white.fg}`,
    color2: colorCodes.red.fg,
    levelname: 'FATAL'
  }
}

class Logger {
  constructor (filename) {
    this.label = path.basename(filename)
  }

  info (...message) {
    Logger._print(levels.INFO, this.label, ...message)
  }

  warn (...message) {
    Logger._print(levels.WARN, this.label, ...message)
  }

  error (...message) {
    Logger._print(levels.ERROR, this.label, ...message)
  }

  fatal (...message) {
    Logger._print(levels.FATAL, this.label, ...message)
  }

  static _print (level, label, ...message) {
    if (Array.isArray(message)) {
      message = message.join(' ')
    }

    const date = new Date()
    const time = formatter.time(date, 'HH:mm:ss.ms')

    const { color1, color2, levelname } = level
    const reset = getColor('reset')
    return console.log(
      `${reset}${time} ${color1}${levelname}${reset}` +
        ` - ${color2}${label}${reset} > ${color2}${message}${reset}`
    )
  }
}

module.exports = Logger
