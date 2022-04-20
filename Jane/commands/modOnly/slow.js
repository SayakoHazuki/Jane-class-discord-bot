const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

module.exports = class SlowmodeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'slowmode',
      aliases: ['slow', 'sm'],
      category: 737012021,
      description: 'Set the slowmode of a channel',
      usage: 'slowmode <code>',
      minArgs: 1,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (
      message.author.id !== '690822196972486656' &&
      message.author.id !== '726439536401580114' &&
      message.author.id !== '794181749432778753'
    ) {
      return
    }
    try {
      const reg = /^\d+$/
      if (reg.test(args[0]) === false) {
        return message.reply('簡 只能把慢速模式調成一個數字')
      }
      if (args[0] > 21600) {
        return message.reply('這個數字太大了 簡不能把慢速模式調成這個數字')
      }
      if (
        message.author.id === '690822196972486656' ||
        message.author.id === '726439536401580114' ||
        message.author.id === '794181749432778753'
      ) {
        message.channel.setRateLimitPerUser(args[0])
        message.reply(`慢速模式已調成${args[0]}秒`)
      } else {
        return message.reply('對不起!你不能使用此指令。')
      }
    } catch (e) {
      message.reply('簡 發現了一個錯誤 .-.\n請<@690822196972486656>幫幫忙')
      logger.error(e)
    }
  }
}
