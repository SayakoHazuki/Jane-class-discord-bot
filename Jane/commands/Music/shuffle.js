const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

module.exports = class shuffleCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'shuffle',
      category: '音樂',
      description: 'to bo done',
      usage: 'to be done',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    try {
      this.client.player.shuffle(message)
      message.reply(':twisted_rightwards_arrows: 已隨機重新分佈歌曲順序')
    } catch (e) {
      logger.error(e.stack)
    }
  }
}
