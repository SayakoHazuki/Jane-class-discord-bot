const Command = require('../../core/command')

const { exec } = require('child_process')

module.exports = class ShellCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'logs',
      aliases: ['viewLogs'],
      category: 737012021,
      description: '(modOnly) execute shell commands',
      usage: 'logs',
      minArgs: 1,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (
      message.author.id !== '690822196972486656' &&
      message.author.id !== '726439536401580114' &&
      message.author.id !== '794181749432778753'
    ) {
      return
    }
    function splitsend (str) {
      const sendarr = str.match(/[\s\S]{1,1900}/g)
      let i
      for (i = 0; i < sendarr.length; i++) {
        message.reply(sendarr[i], { code: 'xl' })
      }
    }

    if (
      message.author.id !== '690822196972486656' &&
      message.author.id !== '561866357218607114'
    ) {
      return false
    }

    exec('pm2 logs jane --lines 200 --nostream', (error, stdout, stderr) => {
      if (error || stderr) {
        return message.reply(
          "Couldn't run command pm2... Please check if this is being runned on a Raspi"
        )
      }
      return splitsend(stdout)
    })
  }
}
