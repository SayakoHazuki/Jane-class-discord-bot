const Command = require('cmd')
const Util = require('utils')
module.exports = class filterCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'filter',
      category: '音樂',
      description: 'to be done',
      usage: 'to be done',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (!args[0] || !this.client.player.filters.names.includes(args[0])) {
      if (args[0]?.toLowerCase() === 'clear') {
        const newFilters = {}
        await this.client.player.pause(message)
        this.client.player.filters.names.forEach(filterName => {
          newFilters[filterName] = false
        })
        Util.printLog('info', __filename, newFilters)
        await this.client.player.setFilters(message, newFilters)
        await this.client.player.resume(message)
        return
      }
      return message.channel.send(Util.InfoEmbed(message, 'Available filters', `\`${this.client.player.filters.names.join('` `')}\``))
    }
    try {
      await this.client.player.pause(message)
      const newFilters = {}
      newFilters[args[0]] = true
      await this.client.player.setFilters(message, newFilters)
      await this.client.player.resume(message)
      return await message.reply(`:white_check_mark: 已啟用 \`${args[0]}\` 效果`)
    } catch (e) {
      Util.printLog('ERR', __filename, e.stack)
    }
  }
}
