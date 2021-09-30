const Discord = require('discord.js')
const Command = require('cmd')

const Util = require('utils')
const charGroups = {
  4: ['狼', '巫', '民', '民'],
  5: ['狼', '預', '獵', '民', '民'],
  6: ['狼', '狼', '預', '獵', '民', '民'],
  7: ['狼', '狼', '預', '巫', '獵', '民', '民'],
  8: ['狼', '狼', '狼', '預', '巫', '獵', '守', '民'],
  9: ['狼', '狼', '狼', '預', '巫', '獵', '民', '民', '民'],
  10: ['狼', '狼', '狼', '預', '巫', '獵', '民', '民', '民', '民'],
  11: ['狼', '狼', '狼', '狼', '預', '巫', '獵', '守', '民', '民', '民'],
  12: ['狼', '狼', '狼', '狼', '預', '巫', '獵', '守', '民', '民', '民', '民']
}

function randomPick (a1, a2) {
  const charArray = JSON.parse(a1)
  const plrArray = JSON.parse(a2)
  function extractRandom (arr) {
    const index = Math.floor(Math.random() * arr.length)
    const result = arr[index]
    arr.splice(index, 1)
    return result
  }

  const result = {}
  while (charArray.length || plrArray.length) {
    if (charArray.length) {
      result[extractRandom(plrArray)] = extractRandom(charArray)
    }
  }
  return result
}

function convertChar (character) {
  return JSON.parse(
    JSON.stringify(character)
      .replace(/狼/g, '狼人')
      .replace(/預/g, '預言家')
      .replace(/巫/g, '女巫')
      .replace(/獵/g, '獵人')
      .replace(/守/g, '守衛')
      .replace(/民/g, '平民')
  )
}

const charNum = {
  0: '平民',
  1: '預言家',
  2: '女巫',
  3: '獵人',
  4: '守衛',
  5: '狼人'
}

module.exports = class wolfCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'wolf',
      aliases: ['mafia', 'werewolf', '狼人'],
      category: '一般',
      description: '開始一個狼人殺遊戲',
      usage: 'wolf help|cmd|create|pick',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const client = this.client
    if (args[0] === 'help' || !args[0]) {
      const helpEmbed = new Discord.MessageEmbed()
        .setTitle('狼人殺普通玩法簡介')
        .addFields([
          {
            name: '角色描述及技能',
            value:
              '**好人陣營**\n`0`平民\n沒有特殊技能，黑夜全程閉眼，透過白天階段所得資訊投票放逐疑似狼人的玩家。\n\n`1`預言家[神職]\n每晚可查一位存活玩家的陣營\n\n`2`女巫[神職]\n擁有一瓶解藥和一瓶毒藥，解藥未使用時可得知狼人的殺害對象，並決定是否救這一位玩家。解藥不能解救自己。女巫也可將懷疑的對象毒殺，該對象死後不能發動技能。解藥和毒藥不可在同一夜使用。\n\n`3`獵人[神職]\n除被毒殺外，被淘汰時可公開角色發動技能帶走一位玩家，可以選擇不發動技能。\n\n`4`守衛[神職]\n每晚可以選擇守護一名玩家免受狼人殺害，並可以選擇守護自己，不可連續兩晚守護同一人。守衛的守護不能擋掉女巫的毒藥。\n\n**狼人陣營**\n`5`狼人\n黑夜可以與隊友討論戰術與選擇殺害對象。狼人可以選擇不殺害任何玩家或自殺。'
          },
          {
            name: '狼人殺基本指令',
            value:
              '-wolf help: 顯示本列表\n-wolf create: 建立新遊戲\n-wolf cmd: 顯示詳細指令使用方法'
          }
        ])
        .setColor(this.client.colors.purple)
      return message.channel.send(helpEmbed)
    }
    if (args[0] === 'cmd') {
      const cmdEmbed = new Discord.MessageEmbed()
        .addFields(
          {
            name: '基本指令',
            value:
              '-wolf create `加入時限(秒)(選填)`\n> 建立新的狼人殺遊戲\n\n-wolf help\n> 查看基本玩法、角色列表及指令簡介等資訊\n\n-wolf cmd\n> 查看本指令列表\n** **'
          },
          {
            name: '其他指令(不推薦使用)',
            value:
              '-wolf pick `選項(選填)` `@玩家s`\n> 隨機分佈角色\n> 選項: 角色數量(如果不填將會使用預設組合)\n> 格式: [編號]x[數量] + [編號]x[數量]\n> (例如 0x2+1x1+3x1+9x2)\n> 編號為上方角色前的數字\n> (請 @ 遊玩的所有玩家)'
          }
        )
        .setColor(this.client.colors.purple)
      return message.channel.send(cmdEmbed)
    }
    if (args[0] === 'pick') {
      let finalPanel = false
      const errpanel = await message.channel.send(':repeat: 載入中')
      let err = false
      let Chars = 0
      const options = message.content
        .replace(`${message.content.split(' ')[0]} pick`, '')
        .replace(/<@.*>/g, '')
        .replace(/ /g, '')
        .split('+')
      if (options && options.join('').replace(/ /g, '') !== '') {
        Chars = []
        await options.forEach(config => {
          if (!/^[012345]x[0-9]$/.test(config)) {
            message.channel.send(`${options.join('+')} 不是有效的選項`)
            throw new Error(`${options.join('+')} 不是有效的選項`)
          }
          const charName = charNum[Number(config.split('x')[0])]
          const amount = Number(config.split('x')[1])
          Util.printLog('info', __filename, charName + amount)
          for (let i = 0; i < amount; i++) {
            Chars.push(charName)
          }
        })
        if (Chars.length !== message.mentions.members.size) {
          err = true
          return message.channel.send(
            `選項含有${Chars.length}位玩家, 但@了${message.mentions.members.size}位玩家`
          )
        }
      }

      if (err) return

      if (!message.mentions.members) {
        return message.channel.send('請 @ 所有玩家')
      }
      if (message.mentions.members.size < 4) {
        return message.channel.send('狼人殺需要最少4個玩家, 請 @ 出所有玩家')
      }
      if (message.mentions.members.size > 12) {
        return message.channel.send(
          '分配角色指令只接受最多12玩家, 請 @ 出所有玩家'
        )
      }
      const charList =
        Chars ||
        (convertChar(charGroups[message.mentions.members.size]) ?? false)
      if (!charList) {
        return message.channel.send(
          '只接受 4 - 12 位玩家 (考慮到遊戲體驗 建議 6位玩家 以上)'
        )
      }
      Util.printLog('info', __filename, charList)
      const plrList = []
      message.mentions.members.forEach(mem => {
        plrList.push(mem.id)
      })
      const charListFixed = JSON.stringify(charList)
      const playerListFixed = JSON.stringify(plrList)
      const matchedCharsOBJ = randomPick(charListFixed, playerListFixed)
      let matchedCharsString = ''
      const errMem = []
      for (const player in matchedCharsOBJ) {
        const role = matchedCharsOBJ[player]
        const roleEmbed = new Discord.MessageEmbed()
          .setTitle('狼人殺')
          .setDescription(`你的角色為 : \`${role}\``)
          .setFooter(`本遊戲主持為 ${message.author.tag}`)
        this.client.users.cache
          .get(player)
          .send(roleEmbed)
          .catch(async e => {
            if (errMem?.length === 0) {
              for (const player in matchedCharsOBJ) {
                this.client.users.cache
                  .get(player)
                  .send(
                    '<:cross_mark:844186420553187378> 遊戲因其中一些玩家關閉了DM而取消了, 上面身分現在無效'
                  )
              }
              message.author.send(
                '<:cross_mark:844186420553187378> 遊戲因其中一些玩家關閉了DM而取消了, 上面身分現在無效'
              )
            }

            if (finalPanel) finalPanel.delete({ timeout: 0 })
            Util.printLog('err', __filename, errpanel)
            errMem.push(player)
            await errpanel.edit(
              `無法發送DM至 <@${errMem.join(
                '> <@'
              )}>, 請確定沒有封鎖了簡並已經開啟本群私訊設定 (https://janesite.ga/enableDM.png)`
            )
          })

        matchedCharsString += `${
          this.client.users.cache.get(player).tag
        } - ${role}\n`
      }
      const charsPickedEmbed = new Discord.MessageEmbed()
        .setTitle('狼人殺隨機角色分配')
        .setDescription(`${matchedCharsString}`)
      await message.author.send(charsPickedEmbed).catch(e => {
        err = true
        message.inlineReply(
          '未能傳送私訊給你, 請確定沒有封鎖了簡並已經開啟本群私訊設定(見下圖)',
          {
            files: ['https://i.imgur.com/4P69LoZ.png']
          }
        )
      })
      if (err) return
      const PlayersEmbed = new Discord.MessageEmbed()
        .setTitle('狼人殺')
        .setDescription(
          `**玩家**\n> <@${plrList
            .sort()
            .join(
              '>\n> <@'
            )}>\n\n**角色 (排序不分先後)**\n> ${charList
            .sort()
            .join(' ')}\n\n<@${
            message.author.id
          }>[主持]**  **請檢查你的私訊來查看角色分配`
        )
      // JSON.stringify(randomPick(charList, plrList), null, '  ')

      finalPanel =
        errMem?.length >= 0 ? false : await message.inlineReply(PlayersEmbed)
    }
    if (args[0] === 'create') {
      const waitTime = (Number(args[1]) || 60) * 1000
      const startTime = new Date(new Date().getTime() + waitTime)
      const members = []
      const joinEmbed = new Discord.MessageEmbed()
        .setTitle('狼人殺')
        .setDescription('**玩家**\n> [暫時沒有]')
        .setFooter(
          `按下打氣棒來加入遊戲,截止時間 : ${startTime.toLocaleTimeString()}`
        )
        .setColor(this.client.colors.blue)
      const joinPanel = await message.inlineReply(joinEmbed)
      const filter = (reaction, user) => {
        return reaction.emoji.id === '844470079109988362'
      }
      await joinPanel.react('844470079109988362')
      const collector = joinPanel.createReactionCollector(filter, {
        time: waitTime
      })

      collector.on('collect', (reaction, user) => {
        if (members.includes(user.id)) return
        members.push(user.id)
        const membersEmbed = new Discord.MessageEmbed()
          .setTitle('狼人殺')
          .setDescription(`**玩家**\n> <@${members.join('>\n> <@')}>`)
          .setFooter(
            `按下打氣棒來加入遊戲,截止時間 : ${startTime.toLocaleTimeString()}`
          )
          .setColor(this.client.colors.blue)
        joinPanel.edit(membersEmbed)
      })

      collector.on('end', collected => {
        if ((members.length || 0) <= 3) {
          return message.inlineReply(
            `只有${members.length ||
              0}位玩家加入, 未達到最低人數要求, 遊戲已取消`
          )
        }
        collectRoles()
      })

      async function collectRoles (times = 0) {
        const rolesEmbed = new Discord.MessageEmbed()
          .setTitle('角色設定')
          .setDescription(
            '請以下面格式輸入角色設定\n```\n0x狼人+0x預言+0x女巫+0x獵人+0x守衛```\n餘下玩家將自動被分配為平民' +
              `\n[${members.length}位玩家已加入]`
          )
          .setFooter('可以輸入`預設`以使用預設角色分配')
          .setColor(this.client.colors.green)
        await message.inlineReply(rolesEmbed)

        const msgfilter = response => {
          return response.author.id === message.author.id
        }

        message.channel
          .awaitMessages(msgfilter, { max: 1, time: 120000, errors: ['time'] })
          .then(collected => {
            handleRolesConfig(collected.first().content, times)
          })
          .catch(collected => {
            message.channel.send('遊戲已取消 : 過了2分鐘仍沒有收到角色設定訊息')
          })
      }

      async function handleRolesConfig (config, times = 0) {
        const roles = []
        const format = /^[0-9]x狼人\+[0-9]x預言\+[0-9]x女巫\+[0-9]x獵人\+[0-9]x守衛$/
        const configValid = format.test(config)
        if (!configValid) {
          if (times >= 2) {
            return message.channel.send(`${config}並不是有效的格式, 遊戲已取消`)
          }
          message.channel.send(`${config}並不是有效的格式`)
          return collectRoles(times + 1)
        }

        const options = config.split('+')
        await options.forEach(part => {
          if (!/^[012345]x..$/.test(part)) {
            message.channel.send(`${config} 不是有效的選項`)
            return collectRoles(times + 1)
          }
          const charName =
            part.split('x')[1] === '預言' ? '預言家' : part.split('x')[1]
          const amount = Number(part.split('x')[0])
          Util.printLog('info', __filename, charName + amount)
          for (let i = 0; i < amount; i++) {
            roles.push(charName)
          }
        })
        for (let i = roles.length; i < members.length; i++) {
          roles.push('平民')
        }
        if (roles.length !== members.length) {
          message.channel.send(
            `${config} 不是有效的選項 : 提供了 ${roles.length} 個角色, 但只有${members.length}位玩家`
          )
          return collectRoles(times + 1)
        }
        const confirmationEmbed = new Discord.MessageEmbed()
          .setTitle('正在等待開始遊戲')
          .setDescription(
            `**玩家**\n> <@${members.join(
              '>\n> <@'
            )}>\n\n**角色 (排序不分先後)**\n> ${roles.sort().join(' ')}\n\n<@${
              message.author.id
            }> 請使用\`${
              message.content.split(' ')[0]
            } start\`開始分配角色並開始遊戲`
          )
          .setColor(this.client.colors.green)
        await message.inlineReply(confirmationEmbed)
        const confirmationfilter = m =>
          m.content.startsWith(`${message.content.split(' ')[0]} `)
        const confirmationcollector = message.channel.createMessageCollector(
          confirmationfilter,
          {
            time: 30000
          }
        )

        confirmationcollector.on('collect', m => {
          const mCmd = m.content.split(' ')[1]
          if (mCmd === 'cancel') {
            confirmationcollector.stop('cancel')
            throw new Error('Cancel!')
          }
          if (mCmd === 'start') {
            startGame()
          }
        })

        confirmationcollector.on('end', collected => {
          Util.printLog(
            'info',
            __filename,
            `Collected ${collected.size} message`
          )
        })

        async function startGame () {
          const errpanel = await message.channel.send(':repeat: 載入中')
          const charListFixed = JSON.stringify(roles)
          const playerListFixed = JSON.stringify(members)
          const matchedCharsOBJ = randomPick(charListFixed, playerListFixed)
          let matchedCharsString = ''
          const errMem = []
          for (const player in matchedCharsOBJ) {
            const role = matchedCharsOBJ[player]
            const roleEmbed = new Discord.MessageEmbed()
              .setTitle('狼人殺')
              .setDescription(`你的角色為 : \`${role}\``)
              .setFooter(`本遊戲主持為 ${message.author.tag}`)
            client.users.cache
              .get(player)
              .send(roleEmbed)
              .catch(async e => {
                if (errMem?.length === 0) {
                  for (const player in matchedCharsOBJ) {
                    client.users.cache
                      .get(player)
                      .send(
                        '<:cross_mark:844186420553187378> 遊戲因其中一些玩家關閉了DM而取消了, 上面身分現在無效'
                      )
                  }
                  message.author.send(
                    '<:cross_mark:844186420553187378> 遊戲因其中一些玩家關閉了DM而取消了, 上面身分現在無效'
                  )
                }
                errMem.push(player)
                await errpanel.edit(
                  `無法發送DM至 <@${errMem.join(
                    '> <@'
                  )}>, 請確定沒有封鎖了簡並已經開啟本群私訊設定 (https://janesite.ga/enableDM.png)`
                )
              })
            matchedCharsString += `${
              client.users.cache.get(player).tag
            } - ${role}\n`
          }
          const charsPickedEmbed = new Discord.MessageEmbed()
            .setTitle('狼人殺隨機角色分配')
            .setDescription(`${matchedCharsString}`)
          await message.author.send(charsPickedEmbed).catch(e => {
            message.inlineReply(
              '未能傳送私訊給你, 請確定沒有封鎖了簡並已經開啟本群私訊設定(見下圖)',
              {
                files: ['https://i.imgur.com/4P69LoZ.png']
              }
            )
          })
          Util.printLog('err', __filename, 'line410' + errMem)
          Util.printLog('err', __filename, 'line411' + errMem?.length)
          if (errMem?.length >= 1) {
            // idk
          } else {
            const startedEmbed = new Discord.MessageEmbed()
              .setTitle('狼人殺')
              .setDescription(
                '遊戲現在開始\n請查看私訊檢查角色, 並於夜晚全程關上麥克風(主持人除外)'
              )
              .setColor(this.client.colors.green)
            message.channel.send(startedEmbed)
          }
        }
      }
    }
  }
}
