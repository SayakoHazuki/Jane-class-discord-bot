const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

const Discord = require('discord.js')

module.exports = class EvalCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'eval',
      aliases: ['ev', 'evaluate'],
      category: 737012021,
      description: 'Evaluates code given',
      usage: 'eval <code>',
      minArgs: 1,
      maxArgs: -1,
      devOnly: true
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
    const code = message.content
      .replace(`${this.client.prefix}${this.name} `, '')
      .replace(`${this.client.prefix}evaluate `, '')
    try {
      let ev = eval(code)
      let highlightCode = null
      let typeOfEv
      logger.info(ev)
      try {
        typeOfEv = Util.whatsIt(JSON.stringify(ev))
      } catch (e) {
        typeOfEv = Util.whatsIt(ev)
      }
      logger.info(`typeOfEv: ${typeOfEv}`)
      if (typeOfEv === 'jsonString') {
        try {
          ev = JSON.stringify(ev, null, 2)
        } catch (e) {}
        highlightCode = 'json'
      }
      if (typeOfEv === 'String') highlightCode = 'js'
      if (typeOfEv === 'Object' || typeOfEv === 'Array') {
        highlightCode = 'json'
        ev = JSON.stringify(ev)
      }
      if (typeOfEv === 'null' || typeOfEv === 'undefined') highlightCode = 'fix'
      if (highlightCode === null) highlightCode = 'xl'
      logger.info(highlightCode)
      return message.reply(Discord.Formatters.codeBlock(highlightCode, ev))
    } catch (err) {
      return message.reply(Discord.Formatters.codeBlock('xl', err.stack))
    }
  }
}
