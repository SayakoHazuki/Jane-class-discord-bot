const { MessageEmbed } = require('discord.js')
const terminal = require('../Utils/terminal')
function printLog (type, filename, ...message) {
  if (!message) {
    message = filename
    filename = __filename
  }
  return terminal.print(type, __filename ?? filename, message)
}

const Evt = require('../core/e')

module.exports = class Message extends Evt {
  constructor (client) {
    super(client, 'messageReactionAdd')
  }

  async run (reaction) {
    const client = this.client
    const kusaEmoji = client.guilds.cache
      .get('799269481247014912')
      ?.emojis.cache.find(emoji => emoji.name === 'kusa')
    const handleStarboard = async () => {
      printLog(
        'info',
        __filename,
        'Kusa emoji received, running handleStarboard function'
      )
      const starboard = client.channels.cache.find(
        channel => channel.name.toLowerCase() === 'kusaboard'
      )
      if (!starboard) return
      const msgs = await starboard.messages.fetch({ limit: 100 })
      const existingMsg = msgs.find(msg =>
        msg.embeds.length === 1
          ? msg.embeds[0].footer.text.startsWith(reaction.message.id)
          : false
      )
      if (existingMsg) {
        existingMsg.edit(
          `<:kusa:813245908044480542> ${reaction.count} [<#${reaction.message.channel.id}>]`
        )
      } else {
        const embed = new MessageEmbed()
          .setAuthor({
            name: reaction.message.author.tag,
            iconURL: reaction.message.author.displayAvatarURL()
          })
          .addField('訊息連結', `[按此前往訊息](${reaction.message.url})`)
          .setDescription(reaction.message.content)
          .setFooter(reaction.message.id + ' (訊息id) ')
          .setTimestamp()
          .setColor('#BFFF00')
        if (starboard) {
          starboard.send(
            `<:kusa:813245908044480542> 1 [<#${reaction.message.channel.id}>]`,
            embed
          )
        }
      }
    }
    if (reaction.emoji === kusaEmoji) {
      if (reaction.message.channel.name.toLowerCase() === 'starboard') return
      if (reaction.message.partial) {
        await reaction.fetch()
        await reaction.message.fetch()
        handleStarboard()
      } else handleStarboard()
    }
  }
}
