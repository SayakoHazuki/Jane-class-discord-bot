const { MongoClient } = require('mongodb')
const mdburi = process.env.MONGO_URI
const mdbclient = new MongoClient(mdburi)
const Util = require('utils')

const pinkL = '<:p2l:801695331300802603>'
const pinkR = '<:p2r:801695441804591115>'
const pinkC = '<:p2b:801695511047307326>'

const noneL = '<:g2l:801695115244601404>'
const noneR = '<:g2r:801694980279762986>'
const noneC = '<:g2b:801695199641468979>'

const bar = [
  `${noneR}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneL}`, // 0
  `${pinkR}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneL}`, // 1
  `${pinkR}${pinkC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneL}`, // 2
  `${pinkR}${pinkC}${pinkC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneL}`, // 3
  `${pinkR}${pinkC}${pinkC}${pinkC}${noneC}${noneC}${noneC}${noneC}${noneC}${noneL}`, // 4
  `${pinkR}${pinkC}${pinkC}${pinkC}${pinkC}${noneC}${noneC}${noneC}${noneC}${noneL}`, // 5
  `${pinkR}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${noneC}${noneC}${noneC}${noneL}`, // 6
  `${pinkR}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${noneC}${noneC}${noneL}`, // 7
  `${pinkR}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${noneC}${noneL}`, // 8
  `${pinkR}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${noneL}`, // 9
  `${pinkR}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkC}${pinkL}` // 10
]

const Command = require('cmd')

module.exports = class HgdCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'hgd',
      aliases: ['好感度'],
      category: '好感度',
      description: '查看好感度',
      usage: 'hgd',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    let hgdobj, datePat, dateRose, dateFiles, dateFlot, now
    let patdiff, filesdiff, rosediff, flotdiff
    let uhgd, flv, lv, max, perc, remain, color, gmin

    const tips = [
      '在冷卻時間內使用指令的話後果自負喔',
      '請不要把好感度掉到負',
      '請不要在早上給簡準備下午茶喔'
    ]
    const ra = Math.floor(Math.random() * tips.length)
    async function run (ttip) {
      try {
        await mdbclient.connect()
        const database = mdbclient.db('jane')
        const col = database.collection('hgd')
        const query = { name: message.author.id }
        const options = {
          sort: { _id: -1 }
        }
        hgdobj = await col.findOne(query, options)
        if (typeof hgdobj !== 'undefined' && hgdobj) {
          datePat = new Date(hgdobj.pat)
          dateFiles = new Date(hgdobj.files)
          dateRose = new Date(hgdobj.rose)
          dateFlot = new Date(hgdobj.flot)
          now = new Date()
          if (Math.floor((now - datePat) / 60000) < 70560) {
            patdiff = `${Math.floor((now - datePat) / 60000)} 分鐘前`
          } else {
            patdiff = '7 天前 / 沒有紀錄'
          }
          if (Math.floor((now - dateFiles) / 60000) < 70560) {
            filesdiff = `${Math.floor((now - dateFiles) / 60000)} 分鐘前`
          } else {
            filesdiff = '7 天前 / 沒有紀錄'
          }
          if (Math.floor((now - dateRose) / 60000) < 70560) {
            rosediff = `${Math.floor((now - dateRose) / 60000)} 分鐘前`
          } else {
            rosediff = '7 天前 / 沒有紀錄'
          }
          if (Math.floor((now - dateFlot) / 60000) < 70560) {
            flotdiff = `${Math.floor((now - dateFlot) / 60000)} 分鐘前`
          } else {
            flotdiff = '7 天前 / 沒有紀錄'
          }
          uhgd = hgdobj.hgd
          Util.printLog('info', __filename, `uhgd: ${uhgd}`)
          flv = (Number(uhgd) - (Number(uhgd) % 100)) / 100
          Util.printLog('info', __filename, `flv: ${flv}`)
          if (message.author.id === '726439536401580114') {
            lv = ' 母親'
            const mamaEmbed = {
              author: {
                name: `${message.author.tag}`,
                icon_url: `${message.author.avatarURL()}`
              },
              title: '好感度',
              description: `簡的母親\n${bar[10]}   ∞ (無限)\n\n上次使用 -拍拍簡的頭 : ${patdiff}\n上次使用 -幫助簡整理資料 : ${filesdiff}\n上次請簡喝花茶 : ${flotdiff}`,
              color: 16512506,
              footer: {
                text: `Tip: ${ttip} - 簡 `
              }
            }
            return message.channel.send({ embeds: [{ embed: mamaEmbed }] })
          } else {
            if (Number(uhgd) < 0) {
              lv = 0
            } else {
              if (flv === 0) {
                lv = 1
              }
              if (flv >= 1 && flv < 5) {
                lv = 2
              }
              if (flv >= 5 && flv < 15) {
                lv = 3
              }
              if (flv >= 15 && flv < 30) {
                lv = 4
              }
              if (flv >= 30 && flv < 60) {
                lv = 5
              }
              if (flv >= 60 && flv < 100) {
                lv = 6
              }
              if (flv >= 100 && flv < 150) {
                lv = 7
              }
              if (flv >= 150 && flv < 250) {
                lv = 8
              }
              if (flv >= 250 && flv < 1000000) {
                lv = 9
              }
              if (flv >= 1000000) {
                lv = 10
              }
              if (lv === 1) {
                max = 100
              }
              if (lv === 2) {
                max = 500
              }
              if (lv === 3) {
                max = 1500
              }
              if (lv === 4) {
                max = 3000
              }
              if (lv === 5) {
                max = 6000
              }
              if (lv === 6) {
                max = 10000
              }
              if (lv === 7) {
                max = 15000
              }
              if (lv === 8) {
                max = 25000
              }
              if (lv === 9) {
                max = 'level locked'
              }
              if (lv === 10 || lv === ' 母親') {
                max = '(max)'
              }
            }
          }
        } else {
          uhgd = '0'
          lv = 1
          max = 100
          patdiff = '沒有紀錄'
          filesdiff = '沒有紀錄'
          rosediff = '沒有紀錄'
          flotdiff = '沒有紀錄'
        }
        if (lv === ' 母親') return
      } catch (e) {
        message.channel.send(`<@690822196972486656>;\n${e}`)
      } finally {
        if (lv === 0) {
          perc = 0
          max = 0
        }
        if (lv === 1) {
          perc = (Number(uhgd) / 100) * 100
        }
        if (lv === 2) {
          perc = ((Number(uhgd) - 100) / 400) * 100
        }
        if (lv === 3) {
          perc = ((Number(uhgd) - 500) / 1000) * 100
        }
        if (lv === 4) {
          perc = ((Number(uhgd) - 1500) / 1500) * 100
        }
        if (lv === 5) {
          perc = ((Number(uhgd) - 3000) / 3000) * 100
        }
        if (lv === 6) {
          perc = ((Number(uhgd) - 6000) / 4000) * 100
        }
        if (lv === 7) {
          perc = ((Number(uhgd) - 10000) / 5000) * 100
        }
        if (lv === 8) {
          perc = ((Number(uhgd) - 15000) / 10000) * 100
        }
        if (lv === 9 || lv === 10 || lv === ' 母親') {
          perc = 100
        }
        Util.printLog('info', __filename, `perc: ${perc}`)
        remain = Number(perc) % 10
        let barv = (Number(perc) - remain) / 10
        if (barv >= 10) {
          barv = 10
        }
        if (lv === 10 || lv === ' 母親') {
          color = 16514043
        } else {
          gmin = ((Number(uhgd) / 6000) * 240).toString().split('.')[0]
          const B = 255
          let G = 240 - Number(gmin)
          const R = 255
          if (G < 0) {
            G = 0
          }
          Util.printLog('info', __filename, `G: ${G}`)
          color = B * 65536 + G * 256 + R
        }
        if (color < 0) {
          color = 0
        }
        if (color > 16777215) {
          const maxB = 255
          const maxG = 255
          const maxR = 255
          color = maxB * 65536 + maxG * 256 + maxR
        }
        Util.printLog('info', __filename, `color:${color}`)
        Util.printLog('info', __filename, `remain: ${remain}`)
        Util.printLog('info', __filename, `barv: ${barv}`)
        const hgdEmbed = {
          author: {
            name: `${message.author.tag}`,
            icon_url: ''
          },
          title: '好感度',
          description: `等級 ${lv}\n${bar[barv]}  ${uhgd} / ${max}\n\n上次使用 -拍拍簡的頭 : ${patdiff}\n上次使用 -幫助簡整理資料 : ${filesdiff}\n上次贈送白玫瑰給簡 : ${rosediff}\n上次請簡喝花茶 : ${flotdiff}`,
          color: color,
          footer: {
            text: `Tip: ${ttip} - 簡 `
          }
        }
        message.channel.send({ embeds: [{ embed: hgdEmbed }] })
      }
    }
    run(tips[ra]).catch(console.dir)
  }
}
