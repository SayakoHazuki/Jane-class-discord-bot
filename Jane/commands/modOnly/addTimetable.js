const Command = require('cmd')
const Util = require('utils')
const fs = require('fs')
const path = require('path')
const months = [
  'Jan',
  'Febr',
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
const weekday = ['日', '一', '二', '三', '四', '五', '六']

let monthToSet = false
let cycleToSet = 1

module.exports = class addTimetableCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'addtt',
      aliases: ['at'],
      category: 737012021,
      description: 'ModsOnly',
      usage: 'at <count>',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (!monthToSet) monthToSet = months[new Date().getMonth()]
    if (message.author.id === '690822196972486656') {
      if (args[0] === 'setMo' || args[0] === 'setMonth') {
        return setMonth(args[1])
      }
      if (args[0] === 'setCyc' || args[0] === 'setCycle') {
        return setCycle(args[1])
      }
      if (/^([1-3]?[0-9])([A-Ha-h]|\*)$/.test(args[0])) {
        return setDay(
          `${Util.formatNumDigit(RegExp.$1, 2)}${monthToSet}`,
          RegExp.$2
        )
      }
    }

    function setMonth (month) {
      if (/^[1-9]|11|12$/.test(month)) {
        monthToSet = months[month - 1]
        return message.inlineReply(
          `你現在可以編輯 ${month}月 (${monthToSet}) 的日期資訊了`
        )
      }
    }

    function setCycle (cycle) {
      if (/^[1-9]|1[1-9]$/.test(cycle)) {
        cycleToSet = cycle
        return message.inlineReply(
          `你現在可以編輯 Cycle ${cycleToSet} 的日期資訊了`
        )
      }
    }

    function setDay (date, day) {
      Util.printLog('info', __filename, `Date: ${date}, Day: ${day}`)
      const n = `星期${weekday[new Date(`${date},2021`).getDay()]}`
      const dayToSet =
        day === '*'
          ? `學校假期 (${n})`
          : `Cycle ${cycleToSet} Day ${day} (${n})`
      const oldDaysJsonStr = fs.readFileSync(
        path.join(__dirname, '../info/data/sd.json')
      )
      const DaysObj = JSON.parse(oldDaysJsonStr)
      DaysObj[date] = dayToSet
      const newData2 = JSON.stringify(DaysObj, null, '\t')
      fs.writeFile(
        path.join(__dirname, '../info/data/sd.json'),
        newData2,
        err => {
          if (err) throw err
          message.inlineReply(`已新增一項日期資訊: \n\`${date}: ${dayToSet}\``)
          Util.printLog(
            'info',
            __filename,
            `New school day data added: {${date}: ${dayToSet}}`
          )
        }
      )
    }
  }
}
