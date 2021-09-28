const Command = require('cmd')
const Util = require('utils')
module.exports = class loopCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'loop',
      category: '音樂',
      description: 'to be done',
      usage: 'to be done',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const queue = await this.client.player.getQueue(message)
    if (!queue || !this.client.player.isPlaying) {
      return message.inlineReply(
        Util.errEmbed(message, '沒有歌曲在此伺服器播放中')
      )
    }

    const repeatMode = await this.client.player.getQueue(message).repeatMode
    await this.client.player.setRepeatMode(message, !repeatMode)
    message.inlineReply(
      `🔁 ${
        this.client.player.getQueue(message).repeatMode
          ? '已開啟單曲循環'
          : '已關閉單曲循環'
      }`
    )
  }
}
