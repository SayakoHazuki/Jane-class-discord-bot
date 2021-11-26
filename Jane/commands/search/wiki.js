const Discord = require('discord.js')
const wiki = require('wikijs').default
const chineseConv = require('chinese-conv')

const Util = require('utils')
const Command = require('cmd')

module.exports = class WikiCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'wiki',
      aliases: ['維基', '維基百科', 'wikipedia'],
      category: '搜尋',
      description: '搜索萌娘百科',
      usage: '萌百 <關鍵詞>',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    if (!args[0]) return
    const query = message.content.replace(`${message.content.split(' ')[0]}`, '').replace(' --eng', '')
    let panel, apiLang
    apiLang = 'zh'
    if (args[1]) {
      if (message.content.includes(' --eng')) {
        apiLang = 'en'
      }
    }
    try {
      const loading = new Discord.MessageEmbed().setDescription(
        `<a:load:825627249302175745> ${apiLang === 'zh' ? '正在搜尋' : 'Now searching'} ${query}`
      )
      panel = await message.reply({ embeds: [loading] })
    } catch (e) {
      Util.handleErr(e)
    }

    try {
      wiki({ apiUrl: `https://${apiLang}.wikipedia.org/w/api.php` })
        .find(query)
        .then(data => {
          let a = 0
          let result = []
          const wTitle = chineseConv.tify(data.raw.title)
          const pageurl = data.raw.fullurl
          data.content().then(rdata => {
            rdata.forEach(function (obj) {
              a += obj.content.length
              if (a < 5000) {
                result = result.concat({
                  name: `${chineseConv.tify(obj.title)}`,
                  value: `** **${chineseConv
                    .tify(obj.content)
                    .substring(0, 1010)}${
                    obj.content.length > 1010 ? '...' : ''
                  }`
                })
              }
            })
            Util.printLog('err', __filename, result)
            const wikiEmbed = {
              color: 0x0099ff,
              title: wTitle,
              url: pageurl,
              description: '** **',
              fields: result,
              timestamp: new Date(),
              footer: {
                text: `簡在維基百科搜尋 ${args[0]} 的結果`
              }
            }
            panel.edit({ embed: wikiEmbed })
          })
        })
    } catch (e) {
      Util.handleErr(e)
    }
  }
}
