const Discord = require('discord.js')
const Command = require('cmd')
const hgdUtil = require('hgdUtils')

module.exports = class LvUnlockCommand extends Command {
  constructor (client) {
    super(client, {
      name: '解放好感度等級上限',
      aliases: ['解放等級上限', '解鎖好感度等級上限', '解鎖等級上限'],
      category: '好感度',
      description: '解放好感度等級上限',
      usage: '解放好感度等級上限',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const { highLvLocked, hgd, shards } = await hgdUtil.getData(message)
    const level = hgdUtil.getLevel(hgd).value
    if (highLvLocked) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(
          `Lv.${level} | ${message.author.tag}`,
          message.author.displayAvatarURL()
        )
        .setTitle('解放好感度等級上限')
        .setDescription(
          `目前等級上限: Lv.30\n\n${
            shards >= 25 ? '✅' : '⬜'
          } 好感度解放碎片持有數: ${shards}/25\n${
            level === 30 ? '✅' : '⬜'
          } 解放所需好感度等級: ${level}/30`
        )
        .setColor('#FB9EFF')
      message.reply({
        embeds: [embed],
        components: [
          new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setCustomId('unlockHighLv')
              .setLabel('解放好感度等級上限')
              .setStyle('SUCCESS')
              .setDisabled(!(shards >= 25 && level === 30))
          )
        ]
      })
    }
  }
}
