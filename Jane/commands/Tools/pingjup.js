const Command = require('cmd')
module.exports = class NicknameCommand extends Command {
  constructor (client) {
    super(client, {
      name: '平仄',
      category: '一般',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const jyutpingify = require('jyutpingify')

    const cmd = message.content.split(' ')[0]
    const str = message.content.replace(cmd, '')
    message.channel.send(str)
    const preR = jyutpingify.jyutpingify(str)
    const r = preR
      .replace(/[^ 123456789]*[ptk][123456789]|[^ 123456789]*[2356789]/g, '仄')
      .replace(/[^ 123456789]*[14]/g, '平')
      .replace(/(?<=[平仄]) /g, '')
    message.inlineReply(r)
  }
}
