const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

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
        .setAuthor({
          name: '⏩ 已跳過',
          iconURL: message.author.displayAvatarURL()
        })
        .setColor(this.client.colors.blue)
      message.reply({ embeds: [resumeEmbed] })
    } catch (e) {
      logger.error(e.stack)
    }
  }
}
