const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

const hgd = require('hgdUtils')
const config = require('./hgdConfig.json')
const settings = config.settings.afternoonTea

module.exports = class HgdAfternoonTeaCommand extends Command {
  constructor (client) {
    super(client, {
      name: '給簡準備下午茶',
      aliases: ['幫簡準備下午茶', '準備下午茶給簡'],
      category: '好感度',
      description: '給簡準備下午茶',
      usage: '給簡準備下午茶',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const diff = await hgd.getTimeDiff(message, 'AfternoonTea')
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

    if (!hgd.timeInRange(settings.timeRange)) {
      const timeNotInRangeEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `現在不是下午茶時間喔! (${settings.timeRange[0]}~${settings.timeRange[1]})`
        )
        .setTimestamp()
        .setFooter('簡')
      return message.reply({ embeds: [timeNotInRangeEmbed] })
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
    const { oldHgd, newHgd, locked } = await hgd.add(message, 'AfternoonTea', amount)

    if (diffPass) {
      const texts = Util.randomFromArray(config.messages.afternoonTea.pass)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${message.member.displayName} ${config.messages.afternoonTea.actionTitle}`
        )
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `${texts.message}\n好感度+${newHgd -
            oldHgd} (${oldHgd} \u279f ${
            locked ? '🔒' : ''
          } ${newHgd})`
        )
        .setTimestamp()
        .setFooter(`${texts.footer}`)
      message.reply({ embeds: [replyEmbed] })
      await hgd.spinShard(message, 2)
    } else {
      const texts = Util.randomFromArray(config.messages.afternoonTea.fail)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${message.member.displayName} ${config.messages.afternoonTea.actionTitle}`
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
