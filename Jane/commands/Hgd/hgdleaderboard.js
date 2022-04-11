const Discord = require('discord.js')
const Command = require('cmd')

const hgd = require('hgdUtils')

module.exports = class HgdLeaderboardCommand extends Command {
  constructor (client) {
    super(client, {
      name: '好感度排行',
      aliases: ['hgdleaderboard', '好感度排行榜', 'lb'],
      category: '好感度',
      description: '查看好感度排行榜',
      usage: '好感度排行',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const ownRank = await hgd.getRank(message)
    const sortedList = await hgd.getLeaderboard()
    const leaderboardEmbed = new Discord.MessageEmbed()
      .setColor('#FB9EFF')
      .setTitle('好感度排行榜')
      .setAuthor({
        name: `#${
          message.author.id === '726439536401580114'
            ? '母親'
            : ownRank - 1 || '?'
        } ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setDescription(`${sortedList.slice(0, 10).join('\n')}`)
      .setTimestamp()
      .setFooter('簡', '')
    return message.reply({ embeds: [leaderboardEmbed] })
  }
}
