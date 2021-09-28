const Command = require('cmd')
const Util = require('utils')
module.exports = class playCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'add'],
      category: '音樂',
      description: 'play a music / add a music to the queue',
      usage: 'play <link/song>',
      minArgs: 1,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (!args[0]) return message.inlineReply(Util.infoEmbed(message, '請在指令後方加上歌名/連結'))
    try {
      this.client.player.play(message, args.join(' '), true)
    } catch (e) {
      Util.printLog('ERR', __filename, e.stack)
    }
  }
}
