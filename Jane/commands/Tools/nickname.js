const Discord = require('discord.js')
const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

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
        return message.reply(
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
        return message.reply(
          Util.InfoEmbed(
            message,
            `你所輸入的暱稱太長了(長度限制為32字)\n簡不能把你的暱稱改為 ${newNickname}`
          )
        )
      }
      message.member
        .setNickname(newNickname)
        .then(value => {
          const nickReplyEmbed = new Discord.MessageEmbed()
            .setColor(message.member.displayHexColor)
            .setDescription(
              `:white_check_mark: 簡已經把你的暱稱改成了 ${newNickname}`
            )
            .setAuthor({
              name: message.author.tag,
              iconURL: message.author.displayAvatarURL()
            })

          message.reply({ embeds: [nickReplyEmbed] })
        })
        .catch(e => {
          if (e.code === 50013) {
            return message.reply(
              Util.errEmbed(
                message,
                '簡 未能更改你的暱稱',
                '這似乎是因為簡沒有足夠的權限以進行此動作, 或是使用指令的用戶身分組比簡高'
              )
            )
          }
        })
    } catch (e) {
      Util.handleErr(e)
    }
  }
}
