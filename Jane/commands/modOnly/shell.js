


const { exec } = require('child_process')

module.exports = class ShellCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'shell',
      aliases: ['sh', 'bash'],
      category: 737012021,
      description: '(modOnly) execute shell commands',
      usage: 'shell <cmd>',
      minArgs: 1,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (message.author.id !== '690822196972486656' && message.author.id !== '726439536401580114' && message.author.id !== '794181749432778753') {
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
    ) { return false }

    exec(message.content.replace(`${message.content.split(' ')[0]} `, ''), (error, stdout, stderr) => {
      if (error) {
        Util.handleErr(error)
        message.reply(`error: ${error.message}`)
        return
      }
      if (stderr) {
        Util.handleErr(stderr)
        message.reply(`stderr: ${stderr}`)
        return
      }
      splitsend(stdout)
    })
  }
}
