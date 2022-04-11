const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

module.exports = class CalendarCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'calendar',
      aliases: ['cal'],
      category: '資訊',
      description: '查看學校校歷表',
      usage: 'cal',
      minArgs: 0,
      maxArgs: 0
    })
  }

  async run (message, args) {
    try {
      const calEmbedTitle = new Discord.MessageEmbed()
        .setTitle('21/22年度校曆表')
        .setFooter(
          `${message.author.tag} 使用了 -cal`,
          message.author.displayAvatarURL()
        )
        .setColor(this.client.themeColor)
        .setDescription(
          '校歷表(PDF檔案) > https://jane.ml/files/calendar.pdf\n校歷表(PNG圖片) > https://jane.ml/academic/cal'
        )
      const calEmbed = new Discord.MessageEmbed()
        .setImage('https://jane.ml/files/cal_2.png')
        .setColor(this.client.themeColor)
      message.channel
        .createWebhook('簡 - 校歷表', {
          avatar: this.client.user.avatarURL({ format: 'png' })
        })
        .then(w => {
          w.send({
            embeds: [calEmbedTitle, calEmbed]
          })
          setTimeout(function () {
            w.delete()
          }, 2500)
        })
    } catch (e) {
      Util.printLog('err', __filename, e.message)
    }
  }
}
