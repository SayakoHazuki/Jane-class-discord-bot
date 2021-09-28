const Evt = require('../core/e')

module.exports = class Message extends Evt {
  constructor (client) {
    super(client, 'messageReactionRemove')
  }

  async run (reaction) {
    const client = this.client
    const kusaEmoji = client.guilds.cache
      .get('799269481247014912')
      ?.emojis.cache.find(emoji => emoji.name === 'kusa')
    const handleStarboard = async () => {
      const starboard = client.channels.cache.find(
        channel => channel.name.toLowerCase() === 'kusaboard'
      )
      if (!starboard) return
      const msgs = await starboard.messages.fetch({ limit: 100 })
      const existingMsg = msgs.find(msg =>
        msg.embeds.length === 1
          ? !!msg.embeds[0].footer.text.startsWith(reaction.message.id)
          : false
      )
      if (existingMsg) {
        if (reaction.count === 0) existingMsg.delete({ timeout: 2500 })
        else {
          existingMsg.edit(
            `<:kusa:813245908044480542> ${reaction.count} [<#${reaction.message.channel.id}>]`
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
