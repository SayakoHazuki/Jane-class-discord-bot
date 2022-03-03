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
      name: 'addLessonArrangement',
      aliases: ['調堂', 'addLA'],
      category: '資訊',
      description: '添加調堂資訊',
      usage: '調堂 (班別) (日期) (第幾節課) (原本課堂) (新的課堂) (新課堂連結)',
      minArgs: 6,
      maxArgs: 6
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

    if (isNaN(args[2]) || !(args[2] >= 1 && args[2] <= 6)) {
      return message.reply(`當日沒有第 ${args[2]} 節課`)
    }

    if (args[3].length >= 10 || args[4].length >= 10) {
      return message.reply('課堂名稱需在10個字母以內')
    }

    if (args[5].length >= 500) {
      return message.reply('連結過長')
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

    if (LAObj[args[0]][dateForJSON]) {
      LAObj[args[0]][dateForJSON].push({
        period: Number(args[2]) - 1,
        from: args[3],
        to: args[4],
        link: args[5]
      })
    } else {
      LAObj[args[0]][dateForJSON] = [
        {
          period: Number(args[2]) - 1,
          from: args[3],
          to: args[4],
          link: args[5]
        }
      ]
    }

    const newData = JSON.stringify(LAObj, null, '\t')
    fs.writeFile(
      path.join(__dirname, '../info/data/lessonArrangements.json'),
      newData,
      err => {
        if (err) throw err
        message.reply(
          `已新增一項調堂資訊: ${dateForJSON} (${Number(args[2])}) - ${
            args[3]
          } \u279f ${args[4]}\nlink: ${args[5]}`
        )
        Util.printLog(
          'info',
          __filename,
          `added LA info: ${dateForJSON} (${Number(args[2])}) - ${
            args[3]
          } \u279f ${args[4]}\nlink: ${args[5]}`
        )
      }
    )
  }
}
