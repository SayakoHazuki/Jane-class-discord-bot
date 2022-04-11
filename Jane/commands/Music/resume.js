const Command = require('cmd')
const Util = require('utils')
const Discord = require('discord.js')
module.exports = class resumeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'resume',
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
      await this.client.player.resume(message)
      const trackNow = this.client.player.nowPlaying(message)
      const progressBarOptions = {
        timecodes: true,
        queue: false,
        length: 10
      }
      const progressBar = this.client.player.createProgressBar(
        message,
        progressBarOptions
      )
      const resumeEmbed = new Discord.MessageEmbed()
        .setAuthor({
          name: '▶️ 已繼續播放',
          iconURL: message.author.displayAvatarURL()
        })
        .setDescription(`[${trackNow.title}](${trackNow.url})\n${progressBar}`)
        .setThumbnail(trackNow.thumbnail)
        .setColor(this.client.colors.green)
      message.reply({ embeds: [resumeEmbed] })
    } catch (e) {
      Util.printLog('ERR', __filename, e.stack)
      const errEmbed = Util.errEmbed(message, '繼續播放歌曲時發生了一個錯誤')
      message.channel.send({ embeds: [errEmbed] })
    }
  }
}
