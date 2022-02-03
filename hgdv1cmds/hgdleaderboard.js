const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)
const Util = require('utils')

const Command = require('cmd')

module.exports = class HgdLeaderboardCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hgdleaderboard',
      aliases: ['lb', 'hgdlb', '好感度排行'],
      category: '好感度',
      description: '查看好感度',
      usage: 'hgdleaderboard',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const cli = this.client
    try {
      Util.printLog('info', __filename, 'Connecting to MongoDB')
      await mdbclient.connect()
      Util.printLog('info', __filename, 'Connected')
      const database = mdbclient.db('jane')
      const col = database.collection('hgdv2')
      const sort = { hgd: -1 }
      col
        .find()
        .sort(sort)
        .limit(10)
        .toArray(function (err, result) {
          if (err) throw err
          let lbstr = ''
          result.forEach(function (obj) {
            lbstr = lbstr.concat(`and${obj.name}o${obj.hgd}o${obj.tag}`)
          })
          const lb = lbstr.substring(3)
          const lbarr = lb.split('and')
          const lbfields = []
          let num = 0
          let fobj
          lbarr.forEach(function (str) {
            const [userID, hgd, tag] = str.split('o')
            if (userID === '726439536401580114') {
              fobj = {
                name: `母親. ${tag || cli.users.cache.get(userID).tag}`,
                value: '好感度: ∞ (無限)'
              }
            } else {
              num += 1
              const thisname = tag || cli.users.cache.get(userID)?.tag
              fobj = { name: `${num}. ${thisname}`, value: `好感度: ${hgd}` }
            }

            lbfields.push(fobj)
          })
          async function send () {
            const embedmsg = await message.channel.send(
              '簡 在努力地整理好感度資料, 請等一等'
            )
            const lbEmbed = {
              color: 16753663,
              title:
                '<:hit_call_jane:801368443463008256>  好感度排行榜  <:hit_call_jane:801368443463008256>',
              description: '** **',
              fields: lbfields,
              timestamp: new Date(),
              footer: {
                text: '正在整理資料的簡'
              }
            }
            embedmsg.edit({ embeds: [lbEmbed] })
          }
          send()
        })
    } catch (e) {
      message.channel.send('```' + e + '```')
    }
  }
}
