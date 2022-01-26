const Discord = require('discord.js')
const Command = require('cmd')

const classLinks = require('./data/classlink.json')

module.exports = class viewLinksCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'viewLinks',
      aliases: ['vl'],
      category: 'info',
      description: 'View all links for online classes',
      usage: 'viewLinks 班別',
      minArgs: 0,
      maxArgs: 1
    })
  }

  async run (message, args) {
    const queryClass = args[0] ? args[0].toUpperCase() : false
    if (queryClass) {
      let links = ''
      if (!['3A', '3B', '3C', '3D'].includes(queryClass)) {
        return message.reply('請輸入大寫的班別 : 3A/3B/3C/3D')
      }
      for (const subject in classLinks[queryClass]) {
        links += `${subject} : ${classLinks[queryClass][subject]}\n`
      }

      const resultEmbed = new Discord.MessageEmbed()
        .setAuthor(
          message.author.username,
          message.author.avatarURL({ format: 'webp' })
        )
        .setTitle('網課連結')
        .setDescription(
          '連結可用 `-al  班別,科目,連結  班別,科目,連結  ...`的指令加上'
        )
        .addFields([{ name: queryClass, value: links }])
        .setFooter(
          '簡 Jane',
          'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
        )
        .setTimestamp()
        .setColor(this.client.colors.green)

      return message.reply({ embeds: [resultEmbed] })
    }
    const links = ['', '', '', '']
    let i = 0
    for (const class_ in classLinks) {
      for (const subject in classLinks[class_]) {
        links[i] += `${subject} : ${classLinks[class_][subject]}\n`
      }
      i++
    }
    const resultEmbed = new Discord.MessageEmbed()
      .setAuthor(
        message.author.username,
        message.author.avatarURL({ format: 'webp' })
      )
      .setTitle('網科連結')
      .setDescription(
        '連結可用 `-al  班別,科目,連結  班別,科目,連結  ...`的指令加上'
      )
      .addFields([
        { name: '3A', value: links[0].substring(0,1020) },
        { name: '3B', value: links[1].substring(0,1020) },
        { name: '3C', value: links[2].substring(0,1020) },
        { name: '3D', value: links[3].substring(0,1020) }
      ])
      .setFooter(
        '簡 Jane',
        'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
      )
      .setTimestamp()
      .setColor(this.client.colors.green)

    message.reply({ embeds: [resultEmbed] })
  }
}
