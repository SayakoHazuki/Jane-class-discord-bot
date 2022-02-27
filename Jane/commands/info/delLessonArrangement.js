const Util = require('utils')
const Command = require('cmd')
const path = require('path')
const fs = require('fs')

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

module.exports = class LessonArrangementCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'delLessonArrangement',
      aliases: ['清除調堂', 'delLA'],
      category: '資訊',
      description: '移除調堂資訊',
      usage: '移除調堂 (班別) (日期) (第幾節課)',
      minArgs: 3,
      maxArgs: 3
    })
  }

  async run (message, args) {
    const originalLA = fs.readFileSync(
      path.join(__dirname, '../info/data/lessonArrangements.json')
    )
    const LAObj = JSON.parse(originalLA)

    if (!(args[0] in LAObj)) {
      return message.reply(`資料庫中找不到 ${args[0]} 班`)
    }

    if (isNaN(args[2])) {
      return message.reply('課堂節數需是數字')
    }

    if (!args[1].includes('/')) return message.reply('日期錯誤 (格式: 13/1)')
    const date = args[1]
      .split('/')
      .map(a => Util.formatNumDigit(a, 2))
      .join('/')
    Util.printLog('INFO', __filename, date)
    if (!/^[0-3][0-9]\/[0-1][0-9]$/.test(date)) {
      return message.reply('日期錯誤 (格式: 13/1)')
    }
    let isValidDateDay
    const [day, month] = args[1].split('/')

    switch (month) {
      case '1':
      case '3':
      case '5':
      case '7':
      case '8':
      case '10':
      case '12':
        isValidDateDay = day >= 1 && day <= 31
        break
      case '4':
      case '6':
      case '9':
      case '11':
        isValidDateDay = day >= 1 && day <= 30
        break
      case '2':
        isValidDateDay = day >= 1 && day <= 28
        break
      default:
        isValidDateDay = false
    }

    if (!isValidDateDay) return message.reply('日期錯誤 (格式: 13/1)')

    const dateForJSON = `${day}${months[month - 1]}`

    const dayLA = LAObj[args[0]][dateForJSON]
    if (!dayLA) return message.reply('找不到相關調堂資訊')

    const relevantLA = dayLA.filter(item => item.period === Number(args[2]) - 1)
    if (relevantLA.length < 1) return message.reply('找不到相關調堂資訊')

    const results = dayLA.filter(item => item.period !== Number(args[2]) - 1)

    LAObj[args[0]][dateForJSON] = results
    const newData = JSON.stringify(LAObj, null, '\t')
    fs.writeFile(
      path.join(__dirname, '../info/data/lessonArrangements.json'),
      newData,
      err => {
        if (err) throw err
        message.reply(
          `已移除以下的調堂資訊: \n\n ${relevantLA
            .map(
              item =>
                `(${item.period + 1}) ${item.from} \u279f ${item.to}\n(link: ${
                  item.link
                })`
            )
            .join('\n\n')}`
        )
        Util.printLog(
          'info',
          __filename,
          `deleted LA info: \n\n ${relevantLA
            .map(
              item =>
                `(${item.period + 1}) ${item.from} \u279f ${item.to}\n(link: ${
                  item.link
                })`
            )
            .join('\n\n')}`
        )
      }
    )
  }
}
