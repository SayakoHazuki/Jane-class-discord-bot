const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

module.exports = class volumeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'volume',
      category: '音樂',
      description: 'to bo done',
      usage: 'to be done',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    try {
      if (isNaN(args[0])) {
        return message.channel.send(
          Util.errEmbed(message, '請提供一個有效的數字作為音量')
        )
      }
      await this.client.player.setVolume(message)
      message.reply(`:white_check_mark: 音量已調為 \`${args[0]}\`%`)
    } catch (e) {
      logger.error(e.stack)
    }
  }
}
