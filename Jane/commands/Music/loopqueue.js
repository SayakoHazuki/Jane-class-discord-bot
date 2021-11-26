const Command = require('cmd')
const Util = require('utils')
module.exports = class loopqueueCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'loopqueue',
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
      return message.reply(
        Util.errEmbed(message, '沒有歌曲在此伺服器播放中')
      )
    }
    const loopMode = await this.client.player.getQueue(message).loopMode
    await this.client.player.setLoopMode(message, !loopMode)
    message.reply(
      `🔁 ${
        this.client.player.getQueue(message).loopMode
          ? '已開啟列表循環'
          : '已關閉列表循環'
      }`
    )
  }
}
