const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

const hgd = require('hgdUtils')
const config = require('../hgdConfig.json')
const settings = config.settings.pat

module.exports = class PatCommand extends Command {
  constructor (client) {
    super(client, {
      name: '拍拍簡的頭',
      aliases: [],
      category: '好感度',
      description: '拍拍簡的頭',
      usage: '拍拍簡的頭',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const diff = await hgd.getTimeDiff(message, 'Pat')
    const diffReq = timeDiff => timeDiff > settings.diffRequirement * 60
    const diffPass = diffReq(diff)
    const { levelPass, level, req } = await hgd.checkLevel(
      message,
      settings.lvRequirement
    )

    if (!levelPass) {
      const lvNotPassEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(`您未達到可以進行該動作的等級 (${level}/${req})`)
        .setTimestamp()
        .setFooter('簡')
      return message.reply({ embeds: [lvNotPassEmbed] })
    }

    Util.printLog(
      'INFO',
      __filename,
      `time difference: ${diff} seconds; Pass: ${diffPass}`
    )
    const { min, max, minFail, maxFail } = settings.hgd
    const amount = diffPass
      ? hgd.random(min, max)
      : hgd.random(minFail, maxFail)
    const { oldHgd, newHgd, locked } = await hgd.add(message, 'Pat', amount)

    if (diffPass) {
      const texts = Util.randomFromArray(config.messages.pat.pass)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${message.member.displayName} ${config.messages.pat.actionTitle}`
        )
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `${texts.message}\n好感度+${newHgd - oldHgd} (${oldHgd} \u279f ${
            locked ? '🔒' : ''
          }${newHgd})`
        )
        .setTimestamp()
        .setFooter(`${texts.footer}`)
      message.reply({ embeds: [replyEmbed] })
      await hgd.spinShard(message)
    } else {
      const texts = Util.randomFromArray(config.messages.pat.fail)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${message.member.displayName} ${config.messages.pat.actionTitle}`
        )
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `${texts.message}\n好感度${amount} (${oldHgd} \u279f ${
            locked ? '🔒' : ''
          } ${newHgd})`
        )
        .setTimestamp()
        .setFooter(`${texts.footer}`)
      message.reply({ embeds: [replyEmbed] })
    }
  }
}
