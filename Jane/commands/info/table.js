const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')
const Ss = require('sUser')

module.exports = class timetableCommand extends Command {
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
    let offset = this.client.timezoneOffset

    const eInfoEmbed = new Discord.MessageEmbed().setDescription(
      `ℹ️ ${
        !args[0]
          ? '發生了一個錯誤'
          : `找不到${args[0]}的課堂資料, 正在顯示本日課堂`
      }`
    )

    if (args[0]) {
      if (/^t{1,9}mr$/.test(args[0])) {
        const am = Number((args[0].match(/t/g) || []).length)
        offset = this.client.timezoneOffset + 24 * am
      } else if (/^[01]?[0-9]d|20d$/.test(args[0])) {
        const amd = Number(args[0].replace(/d/g, ''))
        offset = this.client.timezoneOffset + 24 * amd
      } else {
        offset = args[0] === 'tmr' ? 32 : 8
        if (offset === 8) message.inlineReply(eInfoEmbed)
      }
    }

    const dateWithOffset = new Date(new Date().getTime() + offset * 3600 * 1000)
      .toUTCString()
      .replace(/ GMT$/, '')
    const dateWithOffsetArray = dateWithOffset.split(' ')
    const formattedDate = dateWithOffsetArray[1] + dateWithOffsetArray[2]
    Util.printLog('INFO', __filename, `dateWithOffset: ${formattedDate}`)

    const student = new Ss(this.client, message.author.id)
    await student.saveData()
    let sClass
    if (student.class) {
      sClass = student.class
      Util.printLog('info', __filename, 'Timetable class: ' + sClass)
      const timetableEmbed = Util.getTimetableEmbed(
        formattedDate,
        '21sp',
        false,
        sClass
      )
      if (!timetableEmbed) {
        return message.inlineReply(
          Util.errEmbed(
            message,
            `簡在資料庫中找不到 ${formattedDate} 的課堂資料`,
            ''
          )
        )
      }
      message.inlineReply(timetableEmbed)
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
      const panel = await message.inlineReply(askClassEmbed)

      message.channel
        .awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(async collected => {
          sClass = collected.first().content
          Util.printLog('info', __filename, 'Collected class' + sClass)
          await student.addInfo('sClass', sClass)
          panel.delete()
          collected.first().delete()

          Util.printLog('info', __filename, 'getting timetable embed for class' + sClass)
          const timetableEmbed = Util.getTimetableEmbed(
            formattedDate,
            '21sp',
            false,
            sClass
          )
          if (!timetableEmbed) {
            return message.inlineReply(
              Util.errEmbed(
                message,
                `簡在資料庫中找不到 ${formattedDate} 的課堂資料`,
                ''
              )
            )
          }
          message.inlineReply(timetableEmbed)
        })
        .catch(collected => {
          panel.delete()
        })
    }
  }
}
