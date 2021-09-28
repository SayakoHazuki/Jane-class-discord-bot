const logColor = require('./colorCode.js')
const formatter = require('./formatting.js')

class terminal {
  static print (type, file, ...message) {
    if (Array.isArray(message)) {
      message = message.join(' ')
    }
    const _type = type.toLowerCase()
    const date = new Date()
    const time = formatter.time(date, 'HH:mm:ss.ms')
    if (_type === 'info') {
      return console.log(
        `${logColor('reset')}${time}${logColor('yellow.fg')}${file} >${logColor(
          'reset'
        )} ${logColor('green.fg')}${message}${logColor('reset')}`
      )
    }
    if (_type === 'err') {
      return console.log(
        `${logColor('reset')}${time}${logColor('yellow.fg')}${file} >${logColor(
          'red.fg'
        )} ${logColor('red.bg')}${logColor('white.fg')}Error${logColor(
          'reset'
        )} ${logColor('red.fg')}${message}${logColor('reset')}`
      )
    }
    if (_type === 'warn') {
      return console.log(
        `${logColor('reset')}${time}logColor('yellow.fg')}${file} >${logColor(
          'magenta.fg'
        )} ${logColor('reset')}${logColor('red.fg')}Warn ${logColor(
          'magenta.fg'
        )}${message}${logColor('reset')}`
      )
    }
  }
}

module.exports = terminal
