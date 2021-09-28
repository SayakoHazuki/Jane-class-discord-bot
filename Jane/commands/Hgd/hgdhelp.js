const Command = require('cmd')

module.exports = class hgdHelpCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hgdhelp',
      aliases: ['hgd?', 'hgdmenu', '好感度菜單'],
      category: '好感度',
      description: '好感度指令列表以及系統介紹',
      usage: 'hgdhelp',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const fo = [
      '正在修建白玫瑰的簡',
      '隨時聽從您的指令的簡',
      '正在小歇的簡',
      '正在享受茶點的簡'
    ]
    const tips = ['在冷卻時間內使用指令的話後果自負喔']
    const ra = Math.floor(Math.random() * fo.length)
    const rt = Math.floor(Math.random() * tips.length)
    const embed = {
      title: '指令列表',
      description:
        '簡的好感度系統完成了喔\n以下是好感度的指令列表,努力地增加好感度吧',
      color: 16512506,
      footer: {
        text: fo[ra] + ' | 好感度指令列表'
      },
      author: {
        name: '簡 Jane',
        icon_url:
          'https://cdn.discordapp.com/avatars/801354940265922608/15926e3e52381556b2afd1b29ccb24f7.png'
      },
      fields: [
        {
          name: '-hgd? | -hgdmenu',
          value: '查看此列表'
        },
        {
          name: '-hgd | -好感度',
          value: '查看好感度'
        },
        {
          name: '-hgdlb | -lb',
          value: '查看好感度排行榜'
        },
        {
          name: '-幫助簡整理資料 | -幫簡整理資料',
          value: '幫助簡整理資料庫裡面的資料 (冷卻時間: 15 分鐘)'
        },
        {
          name: '-拍拍簡的頭',
          value: '拍拍簡的頭 (冷卻時間: 30 分鐘)'
        },
        {
          name: '-給簡贈送一支白玫瑰 | -送簡一支白玫瑰',
          value: '送給簡一支白玫瑰 (冷卻時間: 15 分鐘)'
        },
        {
          name: '-給簡準備下午茶',
          value: '給簡準備下午茶（只限下午2-5時,每天一次）'
        },
        {
          name: '-請簡喝花茶',
          value: '給簡一杯花茶 (冷卻時間: 30 分鐘)'
        },
        {
          name: '** **',
          value: `Tip: ${tips[rt]}`
        }
      ],
      timestamp: new Date()
    }
    const menu = await message.channel.send({ embed })
    await menu.react('❎')
    const filter = (reaction, user) =>
      reaction.emoji.name === '❎' && user.id === message.author.id
    const collector = menu.createReactionCollector(filter, { time: 240000 })
    collector.on('collect', (reaction, user) => {
      menu.delete({ timeout: 250 })
    })
    collector.on('end', collected => {
      menu.delete({ timeout: 500 })
    })
  }
}
