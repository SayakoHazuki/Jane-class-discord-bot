const config = require('../commands/Hgd/hgdConfig.json')

const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

const hgd = require('hgdUtils')

const cap = string => string.charAt(0).toUpperCase() + string.slice(1)

class HgdCommand extends Command {
  constructor (client, code) {
    super(client, config.commands[code])
    this.code = code
    this.settings = config.settings[code]
    this.messages = config.messages[code]
  }

  async run (message, args) {
    let diffPass = levelPass = true
    if (settings.diffRequirement) {
      const diff = await hgd.getTimeDiff(message, cap(code))
      const diffValidate = timeDiff => timeDiff > settings.diffRequirement * 60
      diffPass = diffValidate(diff)
    }

    if (this.settings.lvRequirement) {
      let { levelPass, level, req } = await hgd.checkLevel(
        message,
        settings.lvRequirement
      )
    }

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

for (const commandCode in config.commands) {
}

for (const commandPath of commands) {
  const File = require(commandPath)
  let cmd
  try {
    cmd = new File(this)
  } catch (e) {
    Util.printLog('err', __filename, `Cannot create "File" for ${commandPath}`)
    stopFile()
  }
  function stopFile () {
    throw new Error('Stop registering Commands')
  }

  this.commands.set(cmd.name, cmd)
}

Util.printLog(
  'info',
  __filename,
  `Finished loading ${this.commands.size} commands`
)

return this.commands
