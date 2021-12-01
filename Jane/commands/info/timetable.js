/* Constants */
const queryTests = {
  tmrStyle: /^t{1,9}mr$/i,
  shortDateStyle: /^([1-9]|0[1-9]|[1-2][0-9]|3[01])[/\-_](0?[1-9]|1[0-2])$/i,
  longDateStyle: /^(([1-9])|([0][1-9])|([1-2][0-9])|([3][0-1]))[-_/]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i,
  numDateStyle: /^(\d{1,2})(\d{2})$/i,
  daysDiffStyle: /^([01]?[0-9]d|20d)$/i,
  dayOfWeekStyle: /^(Sun|Mon|(T(ues|hurs))|Fri)(day|\.)?$|Wed(\.|nesday)?$|Sat(\.|urday)?$|T((ue?)|(hu?r?))\.?$/i
}

/* Functions */
function monthNumToShort (month) {
  return new Date(`${month} 10`).toLocaleString('en-us', {
    month: 'short'
  })
}

function f (b) {
  return Util.formatDate(new Date(), b)
}

function t () {
  return new Date().toLocaleString('en-us', { month: 'short' })
}

function getNextDayOfTheWeek (
  dayName,
  excludeToday = true,
  refDate = new Date()
) {
  const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(
    dayName.slice(0, 3).toLowerCase()
  )
  if (dayOfWeek < 0) return
  refDate.setHours(0, 0, 0, 0)
  refDate.setDate(
    refDate.getDate() +
      +!!excludeToday +
      ((dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7)
  )
  return refDate
}

/* Modules */
const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')
const Ss = require('sUser')

module.exports = class TimetableCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'timetable',
      aliases: ['table', 't'],
      category: '資訊',
      description: '查看課堂時間表',
      usage: 'timetable [ttt...mr|0-20d]',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    let queryStr
    if (args[0]) {
      queryStr = args[0]
    }
    const query = {
      mode: 'diff',
      daysDifference: 0,
      month: undefined,
      day: undefined,
      jsDate: undefined,
      formattedDate: undefined
    }

    /**
     *   tmrStyle: /^t{1,9}mr$/i,
  shortDateStyle: /^([1-9]|0[1-9]|[1-2][0-9]|3[01])[/\-_](0?[1-9]|1[0-2])$/i,
  longDateStyle: /^(([1-9])|([0][1-9])|([1-2][0-9])|([3][0-1]))[-_/]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i,
  numDateStyle: /^(\d{1,2})(\d{2})$/i,
  daysDiffStyle: /^[01]?[0-9]d|20d$/i,
  dayOfWeekStyle: /^(Sun|Mon|(T(ues|hurs))|Fri)(day|\.)?$|Wed(\.|nesday)?$|Sat(\.|urday)?$|T((ue?)|(hu?r?))\.?$/i
     */

    const noResEmbed = new Discord.MessageEmbed()
      .setTitle(
        `ℹ️ ${
          !args[0]
            ? '發生了一個錯誤'
            : `找不到${args[0]}的課堂資料, 正在顯示本日課堂`
        }`
      )
      .setDescription(
        `這可能是因為提供了不接受的日期格式\n目前接受的日期格式:\n \`tmr\` \`ttmr\` \`${f(
          'd/M'
        )}\` \`${f('dd/MM')}\` \`${f('d/')}${t()}\` \`${f('d-M')}\` \`${f(
          'dd-MM'
        )}\` \`${f('d-')}${t()}\` \`${f('M&dd')}\` \`10^\` \`${f(
          'ddd'
        )}\` \`${f('dddd')}\`等等`
          .replace(/&/g, '')
          .replace(/\^/g, 'd')
      )

    switch (true) {
      case !queryStr:
      case queryTests.tmrStyle.test(queryStr):
        query.mode = 'diff'
        query.daysDifference = queryStr?.match(/t/gi).length || 0
        break

      case queryTests.daysDiffStyle.test(queryStr):
        query.mode = 'diff'
        query.daysDifference = Number(queryStr.replace(/d/i, ''))
        break

      case queryTests.shortDateStyle.test(queryStr):
        query.mode = 'date'
        query.day = RegExp.$1
        query.month = monthNumToShort(RegExp.$2)
        break

      case queryTests.longDateStyle.test(queryStr):
        query.mode = 'date'
        query.day = RegExp.$1
        query.month = RegExp.$6.toUpperCase()
        break

      case queryTests.numDateStyle.test(queryStr):
        query.mode = 'date'
        query.day = RegExp.$2
        query.month = monthNumToShort(RegExp.$1)
        break

      case queryTests.dayOfWeekStyle.test(queryStr):
        query.mode = 'date'
        query.day = getNextDayOfTheWeek(queryStr, false).getDate()
        query.month = getNextDayOfTheWeek(queryStr, false).toLocaleString(
          'en-us',
          {
            month: 'short'
          }
        )
        break

      default:
        message.reply({
          embeds: [noResEmbed]
        })
        break
    }

    Util.printLog('info', __filename, JSON.stringify(query))
    switch (query.mode) {
      case 'diff':
        query.jsDate = new Date(
          new Date().getTime() + (0 + 24 * query.daysDifference) * 3600000
        )
        break

      case 'date':
        query.jsDate = new Date(`${query.month} ${query.day}`)
        break
    }

    query.formattedDate = `${query.jsDate.toLocaleString('en-us', {
      day: '2-digit'
    })}${query.jsDate.toLocaleString('en-us', {
      month: 'short'
    })}`

    const student = new Ss(this.client, message.author.id)
    await student.saveData()

    let sClass
    if (student.class) {
      sClass = student.class
      Util.printLog('info', __filename, 'Timetable class: ' + sClass)
      const timetableEmbed = Util.getTimetableEmbed(
        query.formattedDate,
        '21sp',
        false,
        sClass
      )
      if (!timetableEmbed) {
        return message.reply(
          Util.errEmbed(
            message,
            `簡在資料庫中找不到 ${query.formattedDate} 的課堂資料`,
            ''
          )
        )
      }
      message.reply({ embeds: [timetableEmbed] })
    } else {
      const filter = response => {
        return (
          ['3A', '3B', '3C', '3D'].includes(
            response.content.toUpperCase().replace(/ /g, '')
          ) && response.author.id === message.author.id
        )
      }
      const askClassEmbed = new Discord.MessageEmbed()
        .setDescription('請輸入你的班別 (3A/3B/3C/3D) **[輸入後無法更改]**')
        .setFooter('備註: 簡會記住你的班別, 以便下次查詢時間表時無須再次輸入')
        .setColor(this.client.colors.blue)
      const panel = await message.reply({ embeds: [askClassEmbed] })

      message.channel
        .awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(async collected => {
          sClass = collected.first().content
          Util.printLog('info', __filename, 'Collected class' + sClass)
          await student.addInfo('sClass', sClass)
          panel.delete()
          collected.first().delete()

          Util.printLog(
            'info',
            __filename,
            'getting timetable embed for class' + sClass
          )
          const timetableEmbed = Util.getTimetableEmbed(
            query.formattedDate,
            '21sp',
            false,
            sClass
          )
          if (!timetableEmbed) {
            return message.reply(
              Util.errEmbed(
                message,
                `簡在資料庫中找不到 ${query.formattedDate} 的課堂資料`,
                ''
              )
            )
          }
          message.reply({ embeds: [timetableEmbed] })
        })
        .catch(collected => {
          panel.delete()
        })
    }
  }
}
