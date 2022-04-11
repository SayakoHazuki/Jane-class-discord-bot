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
      const calEmbed = new Discord.MessageEmbed()
        .setTitle('21/22年度校曆表')
        .setImage('https://jane.ml/files/cal_2.png')
        .setColor(this.client.themeColor)
        .setFooter({
          text: `${message.author.tag} 使用了 -cal`,
          iconURL: message.author.displayAvatarURL()
        })
      const linkButtons = new Discord.MessageActionRow().addComponents([
        new Discord.MessageButton()
          .setStyle('LINK')
          .setLabel('下載 (PDF)')
          .setURL('https://jane.ml/files/calendar.pdf'),
        new Discord.MessageButton()
          .setStyle('LINK')
          .setLabel('下載 (PNG)')
          .setURL('https://jane.ml/academic/cal')
      ])
      message
        .reply({
          embeds: [calEmbed],
          components: [linkButtons]
        })
        .catch(e => {
          Util.printLog('ERR', __filename, e.stack)
        })
    } catch (e) {
      Util.printLog('err', __filename, e.message)
    }
  }
}
