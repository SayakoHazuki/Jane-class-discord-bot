const Command = require('cmd')
const { MessageEmbed } = require('discord.js')
module.exports = class PingjupCommand extends Command {
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
    const preR = jyutpingify.jyutpingify(str)
    const r = preR
      .replace(/[^ 123456789]*[ptk][123456789]|[^ 123456789]*[2356789]/g, '仄')
      .replace(/[^ 123456789]*[14]/g, '平')
      .replace(/(?<=[平仄]) /g, '')
    const PingjupEmbed = new MessageEmbed().addFields([
      {
        name: '原文',
        value: str
      },
      {
        name: '對應平仄',
        value: r
      }
    ]).setColor(this.client.colors.blue)
    message.reply({embeds: [PingjupEmbed]})
  }
}
