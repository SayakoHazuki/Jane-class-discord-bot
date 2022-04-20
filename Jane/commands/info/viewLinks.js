const Discord = require('discord.js')
const Command = require('../../core/command')
const Util = require('../../Utils/index.js')

const logger = Util.getLogger(__filename)

const classLinks = require('./data/classlink.json')

module.exports = class viewLinksCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'viewLinks',
      aliases: ['vl'],
      category: 'info',
      description: 'View all links for online classes',
      usage: 'viewLinks',
      minArgs: 0,
      maxArgs: 1
    })
  }

  async run (message, args) {
    const classSelMenu = new Discord.MessageSelectMenu()
      .setCustomId('view-links:class-selection')
      .setPlaceholder('請選擇要查看的班別')
      .addOptions([
        {
          label: '3A',
          description: '查看3A班的網課連結列表',
          value: '3A'
        },
        {
          label: '3B',
          description: '查看3B班的網課連結列表',
          value: '3B'
        },
        {
          label: '3C',
          description: '查看3C班的網課連結列表',
          value: '3C'
        },
        {
          label: '3D',
          description: '查看3D班的網課連結列表',
          value: '3D'
        }
      ])
    message.reply({
      components: [new Discord.MessageActionRow().addComponents(classSelMenu)]
    })
  }

  /**
   * Follow Up Function for Select Menu Interaction
   * @param {Discord.SelectMenuInteraction} interaction
   */
  async followUp (interaction) {
    const finalEmbedFields = []

    const queryClass = interaction.values[0]
    const links = classLinks[queryClass]
    logger.info(links)

    const sliceObject = (myObject, start, end) =>
      Object.keys(myObject)
        .slice(start, end)
        .reduce((result, key) => {
          result[key] = myObject[key]
          return result
        }, {})

    const chunkSize = 7
    for (let i = 0; i < Object.keys(links).length; i += chunkSize) {
      const chunk = sliceObject(links, i, i + chunkSize)

      let chunkValue = ''
      for (const subject in chunk) {
        chunkValue += `${subject} : ${links[subject]}\n`
      }

      finalEmbedFields.push({
        name: '\u2800',
        value: chunkValue
      })
    }

    const resultEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTitle(`${queryClass}班網課連結`)
      .setDescription(
        '連結可用 `-al  班別,科目,連結  班別,科目,連結  ...`的指令加上'
      )
      .addFields(finalEmbedFields)
      .setFooter({
        text: '簡 Jane',
        iconURL:
          'https://cdn.discordapp.com/avatars/801354940265922608/daccb38cb0e479aa002ada8d2b2753df.webp?size=1024'
      })
      .setTimestamp()
      .setColor(this.client.colors.green)

    interaction.reply({ embeds: [resultEmbed] }).catch(e => {
      logger.error(e.stack)
    })
  }
}
