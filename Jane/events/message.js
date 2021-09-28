const Evt = require('../core/e')
const permissions = require('./perms.json')
const Util = require('utils')

module.exports = class Message extends Evt {
  constructor (client) {
    super(client, 'message')
  }

  async run (message) {
    if (message.channel.type === 'dm') {
      return Util.handleDM(message, this.client)
    }
    if (message.author.bot || !message.guild) return

    // Check whether Bot Client User is JaneInfdev
    if (
      this.client.user.id === '801354940265922608' &&
      !message.content.startsWith('-')
    ) {
      return
    }
    if (
      this.client.user.id === '801354940265922608' &&
      message.content.startsWith('--')
    ) {
      return
    }
    if (
      this.client.user.id === '831163022318895209' &&
      !message.content.startsWith('--')
    ) {
      return
    }

    const args = message.content
      .slice(this.client.prefix.length)
      .trim()
      .split(/ +/g)
    const cmd = args.shift().toLowerCase()

    const command =
      this.client.commands.get(cmd) ??
      this.client.commands.find(
        command => command.aliases && command.aliases.includes(cmd)
      )

    if (!command) return

    if (command.authorPermission) {
      const neededPerms = []

      for (const perm of command.authorPermission) {
        if (!message.member.hasPermission(command.authorPermission)) {
          neededPerms.push(permissions[perm])
        }
      }

      if (neededPerms.length) {
        return message.inlineReply(
          `❌ | 你需要 \`${neededPerms.join('`, `')}\` 的權限來執行此指令`
        )
      }
    } else if (command.clientPermission) {
      const neededPerms = []

      for (const perm of command.clientPermission) {
        if (!message.member.hasPermission(perm)) {
          neededPerms.push(permissions[perm])
        }
      }

      if (neededPerms.length) {
        return message.inlineReply(
          `❌ | 我需要 \`${neededPerms.join('`, `')}\` 的權限才能執行此指令`
        )
      }
    }

    if (command.devOnly && command.devOnly === true) {
      if (
        !['561866357218607114', '690822196972486656'].includes(
          message.author.id
        )
      ) {
        return 0
      }
    }

    if (
      (command.minArgs !== undefined && command.minArgs > args.length) ||
      (command.maxArgs !== undefined &&
        command.maxArgs !== -1 &&
        command.maxArgs < args.length)
    ) {
      return message.inlineReply(
        `❌ | 錯誤指令用法 - 請使用或嘗試: \`${this.client.prefix}${command.usage}\`.`
      )
    }

    Util.printLog(
      'info',
      __filename,
      `${Util.logColor('cyan.fg')}${message.author.tag}${Util.logColor(
        'reset'
      )} runned command ${Util.logColor('cyan.fg')}${
        command.name
      }${Util.logColor('reset')}`
    )
    Util.printLog('info', __filename, `${Util.logColor('reset')}\tCmd: ${message.content}`)
    Util.printLog('info', __filename, `${Util.logColor('reset')}Running command ${Util.logColor('cyan.fg')}${command.name}`)

    try {
      command.run(message, args)
    } catch (err) {
      message.inlineReply('❌ | 執行指令期間發生了一個錯誤')
    }
  }
}
