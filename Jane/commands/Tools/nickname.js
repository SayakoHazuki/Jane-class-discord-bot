const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

module.exports = class NicknameCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'nickname',
      aliases: ['nick', 'n'],
      category: '一般',
      description: '更改暱稱',
      usage: 'nickname <新暱稱>',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    try {
      if (!args[0]) {
        return message.inlineReply(
          Util.InfoEmbed(
            message,
            '簡不知道要把你的暱稱改成甚麼',
            '請在指令後方打上你想要的暱稱'
          )
        )
      }

      const newNickname = message.content.replace(
        `${message.content.split(' ')[0]} `,
        ''
      )

      if (
        message.content.replace(`${message.content.split(' ')[0]} `, '')
          .length > 32
      ) {
        return message.inlineReply(
          Util.InfoEmbed(
            message,
            `你所輸入的暱稱太長了(長度限制為32字)\n簡不能把你的暱稱改為 ${newNickname}`
          )
        )
      }

      message.member.setNickname(newNickname)
      const nickReplyEmbed = new Discord.MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setDescription(
          `:white_check_mark: 簡已經把你的暱稱改成了 ${newNickname}`
        )
        .setAuthor(message.author.tag, message.author.displayAvatarURL())

      message.inlineReply(nickReplyEmbed)
    } catch (e) {
      Util.handleErr(e)
    }
  }
}
