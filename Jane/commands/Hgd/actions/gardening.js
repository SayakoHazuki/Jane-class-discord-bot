const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

const hgd = require('hgdUtils')
const config = require('../hgdConfig.json')
const settings = config.settings.gardening

module.exports = class GardeningCommand extends Command {
  constructor (client) {
    super(client, {
      name: '幫簡打理花園',
      aliases: ['和簡打理花園', '協助簡打理花園', '幫助簡打理花園'],
      category: '好感度',
      description: '和簡打理花園',
      usage: '幫簡打理花園',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const diff = await hgd.getTimeDiff(message, 'Gardening')
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

    const dayOfWeek = new Date().getDay()
    const dayOfWeekPass = settings.dayRange.includes(dayOfWeek)
    if (!dayOfWeekPass) {
      const dayOfWeekFailEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `請等到週末再來和簡打理花園吧! ${config.emojis.jane_love.full}`
        )
        .setTimestamp()
        .setFooter('簡')
      return message.reply({ embeds: [dayOfWeekFailEmbed] })
    }

    if (!hgd.timeInRange(settings.timeRange)) {
      const timeNotInRangeEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `現在不是打理花園的時間喔! (${settings.timeRange[0]}~${settings.timeRange[1]})`
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
    const { oldHgd, newHgd, locked } = await hgd.add(
      message,
      'Gardening',
      amount
    )

    if (diffPass) {
      const texts = Util.randomFromArray(config.messages.gardening.pass)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${message.member.displayName} ${config.messages.gardening.actionTitle}`
        )
        .setAuthor(
          message.member.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(
          `${texts.message}\n好感度+${newHgd - oldHgd} (${oldHgd} \u279f ${
            locked ? '🔒' : ''
          } ${newHgd})`
        )
        .setTimestamp()
        .setFooter(`${texts.footer}`)
      message.reply({ embeds: [replyEmbed] })
      await hgd.spinShard(message)
    } else {
      const texts = Util.randomFromArray(config.messages.gardening.fail)
      const replyEmbed = new Discord.MessageEmbed()
        .setColor('#FB9EFF')
        .setTitle(
          `${message.member.displayName} ${config.messages.gardening.actionTitle}`
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
