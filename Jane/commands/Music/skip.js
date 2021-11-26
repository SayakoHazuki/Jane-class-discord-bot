const Command = require('cmd')
const Util = require('utils')
const Discord = require('discord.js')
module.exports = class skipCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'skip',
      category: '音樂',
      description: 'to bo done',
      usage: 'to be done',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    try {
      await this.client.player.skip(message)
      const resumeEmbed = new Discord.MessageEmbed()
        .setAuthor('⏩ 已跳過', message.author.avatarURL())
        .setColor(this.client.colors.blue)
      message.reply({ embeds: [resumeEmbed] })
    } catch (e) {
      Util.printLog('ERR', __filename, e.stack)
    }
  }
}
