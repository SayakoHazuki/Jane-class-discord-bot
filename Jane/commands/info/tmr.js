const Util = require('utils')
const Command = require('cmd')
const Discord = require('discord.js')
const Ss = require('sUser')

module.exports = class TomorrowCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'tomorrow',
      aliases: ['tmr'],
      category: '資訊',
      description: '查看翌日校歷表',
      usage: 'tomorrow',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const query = {
      mode: 'diff',
      daysDifference: 1,
      jsDate: undefined,
      formattedDate: undefined
    }

    query.jsDate = new Date(
      new Date().getTime() + (0 + 24 * query.daysDifference) * 3600000
    )

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
        'ONLINE',
        true,
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
        .awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
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

/*
 */
