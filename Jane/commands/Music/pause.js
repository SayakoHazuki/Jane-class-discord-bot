const Discord = require('discord.js')
const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

module.exports = class pauseCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'pause',
      category: '音樂',
      description: 'to bo done',
      usage: 'to be done',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    try {
      if (!this.client.player.isPlaying(message)) {
        return message.channel.send(
          Util.errEmbed(message, '沒有歌曲在此伺服器播放中')
        )
      }
      const trackNow = this.client.player.nowPlaying(message)
      this.client.player.pause(message)
      const progressBarOptions = {
        timecodes: true,
        queue: false,
        length: 10
      }
      const progressBar = this.client.player.createProgressBar(
        message,
        progressBarOptions
      )
      const pauseEmbed = new Discord.MessageEmbed()
        .setAuthor({
          name: '⏸️ 已暫停',
          iconURL: message.author.displayAvatarURL()
        })
        .setDescription(`[${trackNow.title}](${trackNow.url})\n${progressBar}`)
        .setThumbnail(trackNow.thumbnail)
        .setColor(this.client.colors.yellow)
      message.reply({ embeds: [pauseEmbed] })
    } catch (e) {
      logger.error(e.stack)
      const errEmbed = Util.errEmbed(message, '暫停歌曲時發生了一個錯誤')
      message.channel.send({ embeds: [errEmbed] })
    }
  }
}
