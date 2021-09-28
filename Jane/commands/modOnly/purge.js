const Command = require('cmd')

module.exports = class PurgeCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'purge',
      category: 737012021,
      description: 'ModsOnly',
      usage: 'purge <count>',
      minArgs: 2,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (message.author.id !== '690822196972486656' && message.author.id !== '726439536401580114' && message.author.id !== '794181749432778753') {
      return
    }
    if (message.author.id === '690822196972486656') {
      message.channel.bulkDelete(args[0])
    } else {
      return message.inlineReply('對不起!你不能使用此指令。')
    }
  }
}
