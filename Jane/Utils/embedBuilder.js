const { MessageEmbed } = require('discord.js')
class InfoEmbed {
  constructor (message, title, content) {
    this.t = `ℹ️ ${title}`
    this.c = content || ''
    this.f = `${message.author.tag} 使用了 ${message.content.split(' ')[0]}`
    this.ui = message.author.avatarURL()
  }

  get embed () {
    const res = new MessageEmbed()
      .setColor('#8EC0D8')
      .setTitle(this.t)
      .setFooter(this.f, this.ui)
      .setTimestamp()
    if (this.c) res.setDescription(this.c)
    return res
  }
}
class ExceptionEmbed {
  constructor (message, title, content) {
    this.t = `❌ ${title}`
    this.c = content || false
    this.f = `${message.author.tag} 使用了 ${message.content.split(' ')[0]}`
    this.ui = message.author.avatarURL()
  }

  get embed () {
    const res = new MessageEmbed()
      .setColor('#E3B2B2')
      .setTitle(this.t)
      .setFooter(this.f, this.ui)
      .setTimestamp()
    if (this.c) res.setDescription(this.c)
    return res
  }
}

async function MultiEmbed (msg, pages, emojiList = ['⏪', '⏩'], timeout = 120000) {
  if (!msg && !msg.channel) throw new Error('Channel is inaccessible.')
  if (!pages) throw new Error('Pages are not given.')
  if (emojiList.length !== 2) throw new Error('Need two emojis.')
  let page = 0
  const curPage = await msg.channel.send({ embeds: [pages[page]] })
  for (const emoji of emojiList) await curPage.react(emoji)
  const reactionCollector = curPage.createReactionCollector(
    (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot, {
      time: timeout
    }
  )
  reactionCollector.on('collect', reaction => {
    reaction.users.remove(msg.author)
    switch (reaction.emoji.name) {
      case emojiList[0]:
        page = page > 0 ? --page : pages.length - 1
        break
      case emojiList[1]:
        page = page + 1 < pages.length ? ++page : 0
        break
      default:
        break
    }
    curPage.edit(pages[page])
  })
  reactionCollector.on('end', () => {
    if (!curPage.deleted) {
      curPage.reactions.removeAll()
    }
  })
  return curPage
}

module.exports = { InfoEmbed, ExceptionEmbed, MultiEmbed }
