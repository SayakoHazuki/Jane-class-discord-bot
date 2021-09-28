const Command = require('cmd')
const Discord = require('discord.js')
const Util = require('utils')
module.exports = class queueCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      category: '音樂',
      description: 'to bo done',
      usage: 'to be done',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (!this.client.player.isPlaying(message)) {
      return message.channel.send(
        Util.errEmbed(message, '沒有歌曲在此伺服器播放中')
      )
    }
    const queue = this.client.player.getQueue(message)
    const tracks = queue.tracks
    const nowPlaying = tracks[0]
    try {
      const queueEmbed = new Discord.MessageEmbed()
        .setTitle('歌曲隊伍')
        .setDescription(`正在播放 : [${nowPlaying.title}](${nowPlaying.url})`)
        .setThumbnail('https://i.imgur.com/TKqulli.png')
        .setColor(this.client.themeColor)
      const tracklist = []
      for (const item in tracks) {
        if (Number(item) === 0 || Number(item) >= 10) continue
        const track = tracks[item]
        tracklist.push(
          `\`${item}.\` [${track.title}](${track.url})\n\`  \` :clock7: ${track.duration}\u2800\u2800 <:profile:842405731591913492> ${track.requestedBy?.tag}`
        )
      }
      if (tracklist[0]) {
        const embedFields = []
        tracklist.forEach(track => {
          embedFields.push({ name: '\u2800', value: track })
        })
        queueEmbed.addFields(embedFields)
      }

      message.channel.send(queueEmbed)
    } catch (e) {
      Util.printLog('ERR', __filename, e.stack)
    }
  }
}
