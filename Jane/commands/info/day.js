const Command = require('cmd')
const Util = require('utils')
const Ss = require('sUser')
const { MessageEmbed } = require('discord.js')

module.exports = class DayCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'day',
      aliases: ['d', 'date'],
      category: '資訊',
      description: '查看指定日期的課堂列表',
      usage: 'day <日期>',
      minArgs: 1,
      maxArgs: 1
    })
  }

  async run (message, args) {
    const testRegex = /^[0-3][0-9](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/
    if (!testRegex.test(args[0])) {
      return message.reply(
        Util.InfoEmbed(
          message,
          '格式錯誤',
          '日期格式請根據以下例子:\n2月9日 -> 09Feb'
        )
      )
    }
    const dateToSearch = args[0]
    Util.printLog('INFO', __filename, `dateWithOffset: ${dateToSearch}`)
    const student = new Ss(this.client, message.author.id)
    await student.saveData()
    let sClass
    if (student.class) {
      sClass = student.class
      Util.printLog('info', __filename, 'Timetable class: ' + sClass)
      const timetableEmbed = Util.getTimetableEmbed(
        dateToSearch,
        '21sp',
        false,
        sClass
      )
      if (!timetableEmbed) {
        return message.reply(
          Util.errEmbed(
            message,
            `簡在資料庫中找不到 ${dateToSearch} 的課堂資料`,
            ''
          )
        )
      }
      message.reply({embeds: [timetableEmbed]})
    } else {
      const filter = response => {
        return (
          ['3A', '3B', '3C', '3D'].includes(
            response.content.toUpperCase().replace(/ /g, '')
          ) && response.author.id === message.author.id
        )
      }
      Util.printLog('info', __filename, 'Awaiting class')
      const askClassEmbed = new MessageEmbed()
        .setDescription('請輸入你的班別 (3A/3B/3C/3D) **[輸入後無法更改]**')
        .setFooter('備註: 簡會記住你的班別, 以便下次查詢時間表時無須再次輸入')
        .setColor(this.client.colors.blue)
      const panel = await message.reply({embeds: [askClassEmbed]})

      message.channel
        .awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(async collected => {
          sClass = collected.first().content
          Util.printLog('info', __filename, 'Collected class: ' + sClass)
          await student.addInfo('sClass', sClass)
          panel.delete()
          collected.first().delete()

          Util.printLog('info', __filename, 'getting timetable embed for class', sClass)
          const timetableEmbed = Util.getTimetableEmbed(
            dateToSearch,
            '21sp',
            false,
            sClass
          )
          if (!timetableEmbed) {
            return message.reply(
              Util.errEmbed(
                message,
                `簡在資料庫中找不到 ${dateToSearch} 的課堂資料`,
                ''
              )
            )
          }
          message.reply({embeds: [timetableEmbed]})
        })
        .catch(collected => {
          panel.delete()
        })
    }
  }
}

/*
 */
