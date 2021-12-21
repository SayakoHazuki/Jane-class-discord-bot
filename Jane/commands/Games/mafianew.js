const Discord = require('discord.js')
const Command = require('cmd')
const games = []
let client

const Util = require('utils')

class ReplyEmbeds {
  constructor (client) {
    this.client = client
  }

  get help () {
    return new Discord.MessageEmbed()
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
  }

  get commands () {
    return new Discord.MessageEmbed()
      .addFields({
        name: '狼人殺 - 指令列表',
        value:
          '-wolf create `加入時限(秒)(選填)`\n> 建立新的狼人殺遊戲\n\n-wolf help\n> 查看基本玩法、角色列表及指令簡介等資訊\n\n-wolf cmd\n> 查看本指令列表\n** **'
      })
      .setColor(this.client.colors.purple)
  }
}

class MafiaGame {
  constructor (m, options = {}) {
    if (!m) {
      return Util.printLog(
        'ERR',
        __filename,
        'Missing message when constructing new MafiaGame'
      )
    }
    this.id =
      Date.now()
        .toString(36)
        .substring(7, 10) +
      Math.random()
        .toString(36)
        .substring(2, 7)
    this.status = 'initialization'
    this.message = m
    this.host = m.author
    this.joinTimeLimit = options.joinTimeLimit || 300000
    this.startTime = new Date(new Date().getTime() + this.joinTimeLimit)
    this.players = []
    this.roleSettings = {
      wolf: 1,
      detective: 0,
      witch: 0,
      hunter: 0,
      guard: 0,
      none: 0
    }
    this.notMatchWarnMessage = []
    this.noDMPlayers = []
    this.noDMPlayersList = undefined
    this.roleMessages = []
    this.hostRolesMessage = {}
    this.joinPanel = {}
    this.readableRoles = []
    Util.printLog('info', __filename, `Created game (Id: ${this.id})`)
    Util.printLog(
      'info',
      __filename,
      `\tin: ${this.message.guild.name} > ${this.message.channel.name}`
    )
    this.createPanel()
  }

  async createPanel () {
    this.joinPanel = await this.message.reply({
      embeds: [
        this.embeds.joinPanel
          .setAuthor(`主持: ${this.host.tag}`, this.host.avatarURL())
          .setDescription(
            `**玩家**\n> [暫時沒有]\n\n按下<:LightStickR:844470079109988362>來加入遊戲,截止時間 : ${Util.getDiscordTimestamp(
              this.startTime,
              'T'
            )}`
          )
      ]
    })

    /* Emoji Filters */
    const joinEmojiFilter = (reaction, user) => {
      return (
        reaction.emoji.id === '844470079109988362' &&
        Number(user.id) !== Number(client?.user.id)
      )
    }
    const checkMarkFilter = (reaction, user) => {
      return (
        reaction.emoji.name === '✅' &&
        Number(user.id) !== Number(client?.user.id)
      )
    }

    /* React emojis */
    await this.joinPanel.react('844470079109988362')
    await this.joinPanel.react('✅')

    /* Create Reaction Collectors */
    this.joinsCollector = this.joinPanel.createReactionCollector({
      filter: joinEmojiFilter,
      time: this.joinTimeLimit,
      dispose: true
    })
    this.membersConfirmation = this.joinPanel.createReactionCollector({
      filter: checkMarkFilter,
      time: this.joinTimeLimit
    })

    /* Reaction Collector Events Handler */
    this.joinsCollector.on('collect', (reaction, user) => {
      if (this.players.includes(user.id)) return
      if (Number(user.id) === Number(client.user.id)) return
      this.players.push(user.id)
      this.joinPanel.edit({
        embeds: [
          this.embeds.joinPanel
            .setAuthor(`主持: ${this.host.tag}`, this.host.avatarURL())
            .setDescription(
              `**玩家 (${this.players.length})${
                this.players.length <= 3
                  ? ' [距離最低人數尚欠' +
                    (4 - this.players.length).toString() +
                    '人]'
                  : ''
              }**\n> <@${this.players.join(
                '>\n> <@'
              )}>\n\n按下<:LightStickR:844470079109988362>來加入遊戲,截止時間 : ${Util.getDiscordTimestamp(
                this.startTime,
                'T'
              )}`
            )
            .setFooter(`Game ID:${this.id}`)
        ]
      })
    })

    this.joinsCollector.on('remove', (reaction, user) => {
      const index = this.players.indexOf(user.id)
      if (index === -1) return
      this.players.splice(index, 1)
      this.joinPanel.edit({
        embeds: [
          this.embeds.joinPanel
            .setAuthor(`主持: ${this.host.tag}`, this.host.avatarURL())
            .setDescription(
              `**玩家 (${this.players.length})${
                this.players.length <= 3
                  ? ' [距離最低人數尚欠' +
                    (4 - this.players.length).toString() +
                    '人]'
                  : ''
              }**\n> ${
                this.players.length > 0
                  ? '<@' + this.players.join('>\n> <@') + '>'
                  : '[暫時沒有]'
              }\n\n按下<:LightStickR:844470079109988362>來加入遊戲,截止時間 : ${Util.getDiscordTimestamp(
                this.startTime,
                'T'
              )}`
            )
            .setFooter(`Game ID:${this.id}`)
        ]
      })
    })

    this.joinsCollector.on('end', collected => {
      if ((this.players.length || 0) <= -1) {
        return this.message.reply(
          `只有${this.players.length ||
            0}位玩家加入, 未達到最低人數要求, 遊戲已取消`
        )
      }
      this.collectRolesOptions()
    })

    this.membersConfirmation.on('collect', (reaction, user) => {
      if (Number(user.id) === Number(client.user.id)) return
      this.joinsCollector.stop()
    })
  }

  /* Ask for roles options */
  async collectRolesOptions () {
    if (this.joinPanel.embeds) await Util.tryDelete(this.joinPanel)
    this.selectRolesPanel = await this.message.reply({
      embeds: [this.getRoleEmbed],
      components: this.rolesMenuOptions
    })
    this.selectRolesPanel.react('✅')
    this.selectRolesPanel.react('❎')
    this.awaitConfirmation()
  }

  /* Register Roles (called by select menu operations) */
  registerRolesCount (interaction) {
    const characterTypeStr = interaction.customId
    if (interaction.message.id !== this.selectRolesPanel.id) {
      throw new Error('Message Ids not match!')
    }
    const characterType = characterTypeStr.replace('Count', '')
    const count = interaction.values?.[0]
    this.roleSettings[characterType] = count
    this.selectRolesPanel.edit({
      embeds: [this.getRoleEmbed],
      components: this.rolesMenuOptions
    })
  }

  /* Wait for roles options submission */
  awaitConfirmation () {
    /* Create Reaction Collector */
    const confirmationFilter = (reaction, user) =>
      (reaction.emoji.name === '✅' || reaction.emoji.name === '❎') &&
      user.id === this.host.id
    this.confirmationCollector = this.selectRolesPanel.createReactionCollector({
      filter: confirmationFilter,
      time: 180000
    })

    /* Handle Reaction Collector Events */
    this.confirmationCollector.on('collect', async (reaction, user) => {
      if (user.id === client.user.id) return

      const RolesCountSum = Object.values(this.roleSettings).reduce(
        (a, b) => Number(a) + Number(b)
      )
      switch (reaction.emoji.name) {
        case '✅':
          if (RolesCountSum !== this.players.length) {
            reaction.remove()
            const numNotMatchEmbed = new Discord.MessageEmbed()
              .setAuthor(this.host.tag, this.host.avatarURL())
              .setTitle('角色數量與玩家數量不符')
              .setDescription('請在確認輸入內容無誤後再試一次')
              .setFooter(`Game Id:${this.id}`)
              .setColor(client?.colors?.red)
            this.notMatchWarnMessage.push(
              await this.selectRolesPanel.reply({
                embeds: [numNotMatchEmbed]
              })
            )
            setTimeout(async function () {
              await Util.tryDelete(this.notMatchWarnMessage?.[0])
            }, 10000)
            break
          }
          this.initPlayerRoles()
          break
        case '❎':
          this.cancelGame()
          break
      }
    })
  }

  /* Initialize player roles */
  async initPlayerRoles () {
    if (this.status === 'initRoles') return
    this.status = 'initRoles'
    await Util.tryDelete(this.selectRolesPanel)
    this.roleSettingsArray = []
    for (const character in this.roleSettings) {
      for (let i = 0; i < this.roleSettings[character]; i++) {
        this.roleSettingsArray.push(this.characterChiName[character])
      }
    }

    const roles = MafiaGame.matchCharacters(
      this.roleSettingsArray,
      this.players
    )

    for (const player in roles) {
      this.readableRoles.push({
        identifier: this.readableRoles.length,
        user: client.users.cache.get(player),
        role: roles[player]
      })
      const roleEmbed = new Discord.MessageEmbed()
        .setAuthor(`主持: ${this.host.tag}`, this.host.avatarURL())
        .setTitle('狼人殺 - 角色分配系統')
        .setDescription(`你被分配的角色: **__${roles[player]}__**`)
        .setFooter(`Game Id: ${this.id}`)

      let roleMessage
      await client.users.cache
        .get(player)
        ?.send({ embeds: [roleEmbed] })
        .catch(async e => {
          this.noDMPlayers.push(client.users.cache.get(player))
          if (this.noDMPlayersList) {
            this.noDMPlayersList.edit({ embeds: [this.noDMPlayersEmbed] })
          } else {
            this.noDMPlayersList = await this.message.reply({
              embeds: [this.noDMPlayersEmbed]
            })
          }
        })
        .then(resultMessage => (roleMessage = resultMessage))
      this.roleMessages.push(roleMessage)
    }
    if (this.noDMPlayers.length > 0) return this.cancelGame()
    this.hostRolesMessage = this.host
      .send({
        embeds: [this.playerRolesEmbed]
      })
      .then(result => (this.hostRolesMessage = result))

    this.hostRolesMessage.catch(e => {
      this.message.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setDescription(
              `未能傳送角色列表給 <@${this.host.id}>(主持), 請確定已開啟本群組的私訊設定`
            )
            .setImage('https://i.imgur.com/4P69LoZ.png')
        ]
      })
      return this.cancelGame()
    })

    this.initGame()
  }

  initGame () {
    if (this.status === 'cancelled') return
    /* const startButtonActionRow = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setCustomId(`start_${this.id}`)
        .setLabel('開始遊戲')
        .setStyle('SUCCESS')
    ) */
    this.message.reply({
      embeds: [this.waitingToStartEmbed] // ,
      // components: [startButtonActionRow]
    })
  }

  async cancelGame () {
    if (this.status === 'cancelled') return
    this.status = 'cancelled'
    this.roleMessages?.forEach(async message => {
      if (message?.content || message?.embeds) {
        await Util.tryDelete(message)
      }
    })
    if (this.hostRolesMessage?.content || this.hostRolesMessage?.embeds) {
      await Util.tryDelete(this.hostRolesMessage)
    }
    if (this.joinPanel?.content || this.joinPanel?.embeds) {
      await Util.tryDelete(this.joinPanel)
    }
    this.message.reply({ embeds: [this.embeds.gameCancelled] })
  }

  get noDMPlayersEmbed () {
    return new Discord.MessageEmbed()
      .setDescription(
        `未能傳送角色列表給以下玩家:\n<@${this.noDMPlayers
          .map(o => o.id)
          .join('> <@')}>, 請確定已開啟本群組的私訊設定, 然後重新建立遊戲`
      )
      .setImage('https://i.imgur.com/4P69LoZ.png')
      .setColor(client.colors.red)
      .setFooter(`Game Id:${this.id}`)
  }

  get playerRolesEmbed () {
    const sortedRoles = Util.sortArrayOfObjects(this.readableRoles)
    const rolesListStrings = []
    for (const player of sortedRoles) {
      rolesListStrings.push(`${player.user.tag} - ${player.role}`)
    }
    return new Discord.MessageEmbed()
      .setTitle('狼人殺 - 角色分配系統')
      .setDescription(
        `所隨機分配的角色結果如下:\n\n${rolesListStrings.join('\n')}`
      )
      .setFooter(`Game Id: ${this.id}`)
  }

  get waitingToStartEmbed () {
    let shuffledPlayersList = ''
    let i = 0
    this.players.forEach(player => {
      i++
      shuffledPlayersList += `\n> ${i}. <@${player}>`
    })
    return new Discord.MessageEmbed()
      .setTitle('狼人殺 - 已分配角色')
      .setDescription(
        `請查看你的私訊並等待主持開始\n**玩家**${shuffledPlayersList}\n\n**角色**\n> ${this.roleSettings.wolf} 狼人 \n> ${this.roleSettings.detective} 預言 \n> ${this.roleSettings.witch} 女巫 \n> ${this.roleSettings.hunter} 獵人 \n> ${this.roleSettings.guard} 守衛 \n> ${this.roleSettings.none} 平民`
      )
      .setAuthor(`主持: ${this.host.tag}`, this.host.avatarURL())
      .setFooter(`Game Id:${this.id}`)
      .setColor(client.colors.green)
  }

  get getRoleEmbed () {
    this.roleSettings.none = 0
    const RolesCountSum = Object.values(this.roleSettings).reduce(
      (a, b) => Number(a) + Number(b)
    )
    this.roleSettings.none =
      this.players.length - RolesCountSum < 0
        ? 0
        : this.players.length - RolesCountSum
    return new Discord.MessageEmbed()
      .setTitle('角色設定')
      .setDescription(
        `目前遊戲角色分配:\n${this.roleSettings.wolf}x狼人 \n${
          this.roleSettings.detective
        }x預言 \n${this.roleSettings.witch}x女巫 \n${
          this.roleSettings.hunter
        }x獵人 \n${this.roleSettings.guard}x守衛 \n${
          this.roleSettings.none
        }x平民\n(共${RolesCountSum}個神職角色)${
          RolesCountSum > this.players.length
            ? '\n**:exclamation: 已設置的神職角色數量比玩家數量多 (' +
              RolesCountSum +
              '/' +
              this.players.length +
              ')**'
            : ''
        }\n\n請從下方列表中設定角色數量\n[${this.players.length}位玩家已加入]`
      )
      .setFooter(`Game ID:${this.id}`)
      .setColor(client.colors.green)
  }

  get rolesMenuOptions () {
    const row1 = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('wolfCount')
        .setPlaceholder('選擇狼人數量...')
        .addOptions(this.characterOptions.wolf)
    )
    const row2 = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('detectiveCount')
        .setPlaceholder('選擇預言家數量...')
        .addOptions(this.characterOptions.detective)
    )
    const row3 = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('witchCount')
        .setPlaceholder('選擇女巫數量...')
        .addOptions(this.characterOptions.witch)
    )
    const row4 = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('hunterCount')
        .setPlaceholder('選擇獵人數量...')
        .addOptions(this.characterOptions.hunter)
    )
    const row5 = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('guardCount')
        .setPlaceholder('選擇守衛數量...')
        .addOptions(this.characterOptions.guard)
    )
    return [row1, row2, row3, row4, row5]
  }

  get characterOptions () {
    return {
      wolf: [
        {
          label: '1 狼人',
          description: '1 位狼人',
          value: '1'
        },
        {
          label: '2 狼人',
          description: '2 位狼人',
          value: '2'
        },
        {
          label: '3 狼人',
          description: '3 位狼人',
          value: '3'
        },
        {
          label: '4 狼人',
          description: '4 位狼人',
          value: '4'
        },
        {
          label: '5 狼人',
          description: '5 位狼人',
          value: '5'
        }
      ],
      detective: [
        {
          label: '0 預言家',
          description: '0 位預言家',
          value: '0'
        },
        {
          label: '1 預言家',
          description: '1 位預言家',
          value: '1'
        },
        {
          label: '2 預言家',
          description: '2 位預言家',
          value: '2'
        },
        {
          label: '3 預言家',
          description: '3 位預言家',
          value: '3'
        },
        {
          label: '4 預言家',
          description: '4 位預言家',
          value: '4'
        }
      ],
      witch: [
        {
          label: '0 女巫',
          description: '0 位女巫',
          value: '0'
        },
        {
          label: '1 女巫',
          description: '1 位女巫',
          value: '1'
        },
        {
          label: '2 女巫',
          description: '2 位女巫',
          value: '2'
        },
        {
          label: '3 女巫',
          description: '3 位女巫',
          value: '3'
        },
        {
          label: '4 女巫',
          description: '4 位女巫',
          value: '4'
        }
      ],
      hunter: [
        {
          label: '0 獵人',
          description: '0 位獵人',
          value: '0'
        },
        {
          label: '1 獵人',
          description: '1 位獵人',
          value: '1'
        },
        {
          label: '2 獵人',
          description: '2 位獵人',
          value: '2'
        },
        {
          label: '3 獵人',
          description: '3 位獵人',
          value: '3'
        },
        {
          label: '4 獵人',
          description: '4 位獵人',
          value: '4'
        }
      ],
      guard: [
        {
          label: '0 守衛',
          description: '0 位守衛',
          value: '0'
        },
        {
          label: '1 守衛',
          description: '1 位守衛',
          value: '1'
        },
        {
          label: '2 守衛',
          description: '2 位守衛',
          value: '2'
        },
        {
          label: '3 守衛',
          description: '3 位守衛',
          value: '3'
        },
        {
          label: '4 守衛',
          description: '4 位守衛',
          value: '4'
        }
      ]
    }
  }

  get characterChiName () {
    return {
      wolf: '狼人',
      detective: '預言家',
      witch: '女巫',
      hunter: '獵人',
      guard: '守衛',
      none: '平民'
    }
  }

  get embeds () {
    return {
      joinPanel: new Discord.MessageEmbed()
        .setTitle('狼人殺')
        .setColor(client.colors.blue),
      gameCancelled: new Discord.MessageEmbed()
        .setAuthor(
          this.host.tag || 'Unknown Host',
          this.host.avatarURL || undefined
        )
        .setDescription('遊戲已取消')
        .setColor(client.colors.red)
        .setFooter(`Game Id:${this.id || 'Unknown'}`)
    }
  }

  static matchCharacters (rolesArray, playerArray) {
    function shuffleArray (arr) {
      const array = arr
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
      return array
    }

    const shuffledRolesArray = shuffleArray(rolesArray)
    const shuffledPlayerArray = shuffleArray(playerArray)
    this.reshuffledRolesArray = shuffleArray(shuffledPlayerArray)
    const result = {}
    for (let i = 0; i < shuffledPlayerArray.length; i++) {
      result[shuffledPlayerArray[i]] = shuffledRolesArray[i]
    }

    return result
  }
}

module.exports = class wolfCommand extends Command {
  constructor (client2) {
    client = client2
    super(client2, {
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
    if (!args[0]) args = ['cmd']
    switch (args[0]) {
      case 'help':
        message.reply({ embeds: [new ReplyEmbeds(client).help] })
        break

      case 'create':
        games.push(
          new MafiaGame(message, {
            joinTimeLimit: (Number(args[1]) || 60) * 1000
          })
        )
        Util.printLog(
          'INFO',
          __filename,
          `Length of Games List: ${games.length}`
        )
        break

      case 'cmd':
      default:
        message.reply({ embeds: [new ReplyEmbeds(client).commands] })
        break
    }
  }

  static async handleInteraction (interaction) {
    if (
      [
        'wolfCount',
        'detectiveCount',
        'witchCount',
        'hunterCount',
        'guardCount'
      ].includes(interaction.customId)
    ) {
      const menuMessage = interaction.message
      const gameEmbed = menuMessage.embeds?.[0]
      const gameId = (gameEmbed?.footer?.text).split(':')[1]
      const game = games.find(g => g.id === gameId)
      if (!game) throw new Error()
      game.registerRolesCount(interaction)
    }
  }
}
