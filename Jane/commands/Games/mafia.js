const Discord = require('discord.js')
const Command = require('cmd')
const games = []
let client

let resolveGuardAction,
  rejectGuardAction,
  resolveDetectiveAction,
  rejectDetectiveAction,
  resolveWolfAction,
  rejectWolfAction,
  resolveWitchAction

const Util = require('utils')

class MafiaPlayer {
  constructor ({ identifier, user, role, alive }) {
    this.identifier = identifier
    this.user = user
    this.role = role
    this.alive = alive
  }
}

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
    this.witchOptions = {
      help: 1,
      kill: 1
    }
    this.dayCount = 1
    Util.printLog('info', __filename, `Created game (Id: ${this.id})`)
    Util.printLog(
      'info',
      __filename,
      `\tin: ${this.message.guild.name} > ${this.message.channel.name}`
    )
    this.votes = []
    this.createPanel()
  }

  async createPanel () {
    this.joinPanel = await this.message.reply({
      embeds: [
        this.embeds.joinPanel
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
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
            .setAuthor({
              name: `主持: ${this.host.tag}`,
              iconURL: this.host.displayAvatarURL()
            })
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
            .setAuthor({
              name: `主持: ${this.host.tag}`,
              iconURL: this.host.displayAvatarURL()
            })
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
              .setAuthor({
                name: this.host.tag,
                iconURL: this.host.displayAvatarURL()
              })
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

    Util.printLog('INFO', __filename, roles)

    for (const player in roles) {
      this.readableRoles.push(
        new MafiaPlayer({
          identifier: this.players.indexOf(player) + 1,
          user: client.users.cache.get(player),
          role: roles[player],
          alive: true
        })
      )

      async function getListOfMafias (filterId) {
        const listOfMafia = []
        const mafiaIds = Object.keys(roles).filter(k => roles[k] === '狼人')
        Util.printLog('INFO', __filename, mafiaIds)
        for (const mafiaPlayerId of mafiaIds) {
          Util.printLog(
            'INFO',
            __filename,
            `${mafiaPlayerId === filterId}, ${mafiaPlayerId}`
          )
          if (mafiaPlayerId === filterId) continue
          const mafiaPlayer = await client.users.cache.get(mafiaPlayerId)
          listOfMafia.push(mafiaPlayer.tag)
          Util.printLog(
            'info',
            __filename,
            `Added to mafia list : ${mafiaPlayer.tag}`
          )
        }
        if (!listOfMafia[0]) listOfMafia.push('沒有')
        return listOfMafia
      }

      let roleEmbed
      if (roles[player] === '狼人') {
        roleEmbed = new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle('狼人殺 - 角色分配系統')
          .setDescription(
            `你被分配的角色: **__${roles[player]}__**\n其他狼人玩家: ${(
              await getListOfMafias(player)
            ).join(',')}`
          )
          .setFooter(`Game Id: ${this.id}`)
      } else {
        roleEmbed = new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle('狼人殺 - 角色分配系統')
          .setDescription(`你被分配的角色: **__${roles[player]}__**`)
          .setFooter(`Game Id: ${this.id}`)
      }

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
    Util.printLog(
      'INFO',
      __filename,
      JSON.stringify(this.readableRoles, null, 2)
    )
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

  awaitGuardAction () {
    return new Promise((resolve, reject) => {
      resolveGuardAction = resolve
      rejectGuardAction = reject
      const aliveGuards = this.readableRoles.filter(
        player => player.role === '守衛' && player.alive
      )
      const guards = this.readableRoles.filter(player => player.role === '守衛')
      switch (aliveGuards.length) {
        case 0:
          if (guards.length >= 1) {
            this.message.reply({ embeds: [this.embeds.waitingGuard] })
            setTimeout(
              resolveGuardAction,
              (Math.floor(Math.random() * 10) + 8.5) * 1000
            )
          } else resolveGuardAction()
          break
        case 1:
          this.message.reply({ embeds: [this.embeds.waitingGuard] })
          aliveGuards[0].user.send({
            embeds: [this.embeds.guardAction],
            components: this.playerTargetSelector('guard', '守護')
          })
          break
        default:
          this.message.reply({ embeds: [this.embeds.waitingGuard] })
          aliveGuards[0].user.send({
            embeds: [this.embeds.guardsAction],
            components: this.playerTargetSelector('guard', '守護')
          })
          break
      }
    })
  }

  handleGuardAction (game, targetId) {
    Util.printLog('info', __filename, 'received Guard Action')
    const target = game.readableRoles.find(
      player => player.user.id === targetId
    )
    const guards = game.readableRoles.filter(
      player => player.alive && player.role === '守衛'
    )
    for (const player of guards) {
      player.user.send({
        embeds: [
          new Discord.MessageEmbed()
            .setAuthor({
              name: `主持: ${game.host.tag}`,
              iconURL: game.host.displayAvatarURL()
            })
            .setTitle(`守衛 [遊戲進度: 第${game.dayCount}晚]`)
            .setDescription(`:white_check_mark: 你守護了 ${target.user.tag}`)
        ]
      })
    }
    if (game[`day${game.dayCount}guard`]) {
      rejectGuardAction()
    } else {
      game[`day${game.dayCount}guard`] = targetId
      resolveGuardAction()
    }
  }

  awaitDetectiveAction () {
    return new Promise((resolve, reject) => {
      resolveDetectiveAction = resolve
      rejectDetectiveAction = reject
      const aliveDetectives = this.readableRoles.filter(
        player => player.role === '預言家' && player.alive
      )
      const detectives = this.readableRoles.filter(
        player => player.role === '預言家'
      )
      switch (aliveDetectives.length) {
        case 0:
          if (detectives.length >= 1) {
            this.message.reply({ embeds: [this.embeds.waitingDetective] })
            setTimeout(
              resolveDetectiveAction,
              (Math.floor(Math.random() * 10) + 8.5) * 1000
            )
          } else resolveDetectiveAction()
          break
        case 1:
          this.message.reply({ embeds: [this.embeds.waitingDetective] })
          aliveDetectives[0].user.send({
            embeds: [this.embeds.detectiveAction],
            components: this.playerTargetSelector('detective', '檢查身分')
          })
          break
        default:
          this.message.reply({ embeds: [this.embeds.waitingDetective] })
          for (const player of aliveDetectives) {
            player.user
              .send({
                embeds: [this.embeds.detectiveAction],
                components: this.playerTargetSelector('detective', '檢查身分')
              })
              .catch()
          }
          break
      }
    })
  }

  handleDetectiveAction (game, targetId) {
    Util.printLog('info', __filename, 'received Detective Action')
    const detectives = game.readableRoles.filter(
      player => player.role === '預言家' && player.alive
    )
    const target = game.readableRoles.find(
      player => player.user.id === targetId
    )
    for (const player of detectives) {
      player.user
        .send({
          embeds: [
            new Discord.MessageEmbed()
              .setAuthor({
                name: `主持: ${game.host.tag}`,
                iconURL: game.host.displayAvatarURL()
              })
              .setTitle(`預言家 - 檢查身分 [遊戲進度: 第一${''}晚]`)
              .setDescription(
                `你檢查了 ${target.user.tag} 的身分\n\n${target.user.username}是 __${target.role}__`
              )
              .setFooter(`Game Id:${game.id}`)
          ]
        })
        .catch(e => rejectDetectiveAction(e))
    }
    resolveDetectiveAction()
  }

  awaitWolfAction () {
    return new Promise((resolve, reject) => {
      resolveWolfAction = resolve
      rejectWolfAction = reject
      const wolves = this.readableRoles.filter(
        player => player.role === '狼人' && player.alive
      )
      switch (wolves.length) {
        case 0: // what's the point of making this LOL
          // what
          resolveWolfAction()
          break
        case 1:
          this.message.reply({ embeds: [this.embeds.waitingWolf] })
          wolves[0].user.send({
            embeds: [this.embeds.wolfAction],
            components: this.playerTargetSelector('wolf', '殺')
          })
          break
        default:
          this.message.reply({ embeds: [this.embeds.waitingWolf] })
          wolves[0].user.send({
            embeds: [this.embeds.wolfAction],
            components: this.playerTargetSelector('wolf', '殺')
          })
          break
      }
    })
  }

  handleWolfAction (game, targetId) {
    Util.printLog('info', __filename, 'received Wolf Action')
    const target = game.readableRoles.find(
      player => player.user.id === targetId
    )
    const wolves = game.readableRoles.filter(
      player => player.alive && player.role === '狼人'
    )
    for (const player of wolves) {
      player.user.send({
        embeds: [
          new Discord.MessageEmbed()
            .setAuthor({
              name: `主持: ${game.host.tag}`,
              iconURL: game.host.displayAvatarURL()
            })
            .setTitle(`狼人 [遊戲進度: 第${game.dayCount}晚]`)
            .setDescription(
              `:white_check_mark: 你選擇了殺掉 ${target.user.tag}`
            )
        ]
      })
    }
    if (game[`day${game.dayCount}kill`]) {
      rejectWolfAction()
    } else {
      game[`day${game.dayCount}kill`] = targetId
      resolveWolfAction()
    }
  }

  awaitWitchAction () {
    return new Promise((resolve, reject) => {
      resolveWitchAction = resolve
      const aliveWitches = this.readableRoles.filter(
        player => player.role === '女巫' && player.alive
      )
      const witches = this.readableRoles.filter(
        player => player.role === '女巫'
      )
      const toBeKilledGameUser = this.readableRoles.find(
        player => player.user.id === this[`day${this.dayCount}kill`]
      )
      const witchGameUser = this.readableRoles.find(
        player => player.role === '女巫'
      )
      switch (aliveWitches.length) {
        case 0:
          if (witches.length >= 1) {
            this.message.reply({ embeds: [this.embeds.waitingWitch] })
            setTimeout(
              resolveWitchAction,
              (Math.floor(Math.random() * 10) + 8.5) * 1000
            )
          } else resolveWitchAction()
          break
        case 1:
          this.message.reply({ embeds: [this.embeds.waitingWitch] })
          this.readableRoles.find(player => player.role === '女巫')
          aliveWitches[0].user.send({
            embeds: [
              this.embeds.witchAction.setDescription(
                `今晚死的是[${toBeKilledGameUser.identifier}]${
                  toBeKilledGameUser.user.tag
                }\n\n你${
                  this.witchOptions.help === 0 ||
                  toBeKilledGameUser.user.id === witchGameUser.user.id
                    ? '不可以救他 (藥已用完/不可以救自己)'
                    : '可以選擇救他'
                }\n你${
                  this.witchOptions.kill === 0
                    ? '不可以使用毒藥 (毒藥已用完)'
                    : '可以選擇使用毒藥毒殺一位玩家'
                }`
              )
            ],
            components: this.witchComponents()
          })
          break
        default:
          this.message.reply({ embeds: [this.embeds.waitingWitch] })
          aliveWitches[0].user.send({
            embeds: [
              this.embeds.witchAction.setDescription(
                `今晚死的是${this[`day${this.dayCount}kill`]}\n\n你${
                  this.witchOptions.help === 0 ||
                  this[`day${this.dayCount}kill`] ===
                    this.readableRoles.find(player => player.role === '女巫')
                    ? '不可以救他 (藥已用完/不可以救自己)'
                    : '可以選擇救他'
                }, ${
                  this.witchOptions.help === 0 ||
                  this[`day${this.dayCount}kill`] ===
                    this.readableRoles.find(player => player.role === '女巫')
                    ? '不可以使用毒藥 (毒藥已用完/不可以毒自己)'
                    : '可以選擇使用毒藥毒殺他'
                }`
              )
            ],
            components: this.witchComponents()
          })
          break
      }
    })
  }

  handleWitchAction (game, action) {
    const witches = game.readableRoles.filter(
      player => player.alive && player.role === '女巫'
    )
    const toBeKilledGameUser = this.readableRoles.find(
      player => player.user.id === this[`day${this.dayCount}kill`]
    )
    if (action === 'witchSave') {
      game[`day${game.dayCount}witchSave`] = true
      game[`day${game.dayCount}witchKill`] = false
      for (const player of witches) {
        player.user.send({
          embeds: [
            new Discord.MessageEmbed()
              .setAuthor({
                name: `主持: ${game.host.tag}`,
                iconURL: game.host.displayAvatarURL()
              })
              .setTitle(`女巫 [遊戲進度: 第${game.dayCount}晚]`)
              .setDescription(
                `:white_check_mark: 你使用藥救了 [${toBeKilledGameUser.identifier}]${toBeKilledGameUser.user.tag}`
              )
          ]
        })
      }
    }
    if (action === 'witchSkip') {
      game[`day${game.dayCount}witchSave`] = false
      game[`day${game.dayCount}witchKill`] = false
      for (const player of witches) {
        player.user.send({
          embeds: [
            new Discord.MessageEmbed()
              .setAuthor({
                name: `主持: ${game.host.tag}`,
                iconURL: game.host.displayAvatarURL()
              })
              .setTitle(`女巫 [遊戲進度: 第${game.dayCount}晚]`)
              .setDescription(
                `:white_check_mark: 你跳過了 (昨晚死的是 [${toBeKilledGameUser.identifier}]${toBeKilledGameUser.user.tag})`
              )
          ]
        })
      }
    }
    if (!action.startsWith('witch')) {
      game[`day${game.dayCount}witchSave`] = false
      game[`day${game.dayCount}witchKill`] = action

      for (const player of witches) {
        player.user.send({
          embeds: [
            new Discord.MessageEmbed()
              .setAuthor({
                name: `主持: ${game.host.tag}`,
                iconURL: game.host.displayAvatarURL()
              })
              .setTitle(`女巫 [遊戲進度: 第${game.dayCount}晚]`)
              .setDescription(
                `:white_check_mark: 你對 [${toBeKilledGameUser.identifier}]${toBeKilledGameUser.user.tag} 使用了毒藥`
              )
          ]
        })
      }
    }
    resolveWitchAction()
  }

  async startNight (m) {
    this.message = m
    Util.printLog('INFO', __filename, 'Awaiting Guard Action')
    await this.awaitGuardAction()
    Util.printLog('INFO', __filename, 'Awaiting Detective Action')
    await this.awaitDetectiveAction()
    Util.printLog('INFO', __filename, 'Awaiting Wolf Action')
    await this.awaitWolfAction()
    Util.printLog('INFO', __filename, 'Awaiting Witch Action')
    await this.awaitWitchAction()
    this.startDay(m)
  }

  voteKill (t) {
    t = t.replace(/[^0-9]/g, '')
    Util.printLog('info', __filename, t)
    const i = this.readableRoles.findIndex(player => player.user.id === t)
    Util.printLog('info', __filename, i)
    this.readableRoles[i].alive = false

    this.checkOver()
    if (this.status === 'ended') {
      return this[`day${this.dayCount}votePanel`].reply({
        embeds: [
          new Discord.MessageEmbed()
            .setAuthor({
              name: `主持: ${this.host.tag}`,
              iconURL: this.host.displayAvatarURL()
            })
            .setTitle(`第${this.dayCount}天 投票結果`)
            .setDescription(
              `最高票數為 [${this.readableRoles[i].identifier}] ${this.readableRoles[i].user.tag}`
            )
            .setFooter(`Game Id:${this.id}`)
            .setColor(client.colors.red)
        ]
      })
    }

    this[`day${this.dayCount}votePanel`].reply({
      embeds: [
        new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle(`第${this.dayCount}天 投票結果`)
          .setDescription(
            `最高票數為 [${this.readableRoles[i].identifier}] ${this.readableRoles[i].user.tag}\n該玩家被票死, 請發表遺言`
          )
          .setFooter(`Game Id:${this.id}`)
          .setColor(client.colors.red)
      ]
    })
  }

  async startDay (m) {
    Util.printLog('INFO', __filename, 'Starting Day')

    const deathOfTheNight = []
    const killedByWolfId = this[`day${this.dayCount}kill`]
    const killedByWolf = killedByWolfId
      ? this.readableRoles.find(player => player.user.id === killedByWolfId)
      : false
    Util.printLog('INFO', __filename, `killedByWolfId: ${killedByWolfId}`)

    const guardedId = this[`day${this.dayCount}guard`] || false
    const guarded = guardedId
      ? this.readableRoles.find(player => player.user.id === guardedId)
      : false
    Util.printLog('INFO', __filename, `guardedId: ${guardedId}`)

    const killedByWitchId = this[`day${this.dayCount}witchKill`]
    const killedByWitch = killedByWitchId
      ? this.readableRoles.find(player => player.user.id === killedByWitchId)
      : false
    Util.printLog('INFO', __filename, `killedByWitchId: ${killedByWitchId}`)

    // has guard
    if (guarded?.user?.id === killedByWolf.user.id) {
      if (this[`day${this.dayCount}witchSave`]) {
        // guard + save
        deathOfTheNight.push({ user: killedByWolf, deathMessage: false })
      }
    }

    // no guard no save
    if (
      guarded?.user?.id !== killedByWolf.user.id &&
      !this[`day${this.dayCount}witchSave`]
    ) {
      deathOfTheNight.push({ user: killedByWolf, deathMessage: true })
    }

    // witch Kill
    if (this[`day${this.dayCount}witchKill`]) {
      deathOfTheNight.push({ user: killedByWitch, deathMessage: false })
    }

    Util.printLog('INFO', __filename, `DeathOfTonight: ${deathOfTheNight}`)

    const deadTags = []
    const hasDeathMessages = []
    for (const { user, deathMessage } of deathOfTheNight) {
      const playerIndex = this.readableRoles.findIndex(
        player => player.user.id === user.user.id
      )
      this.readableRoles[playerIndex].alive = false
      deadTags.push(
        `[${this.readableRoles[playerIndex].identifier}] ${this.readableRoles[playerIndex].user.tag}`
      )
      if (deathMessage) {
        hasDeathMessages.push(`[${user.identifier}] ${user.user.tag}`)
      }
    }

    this.checkOver()
    if (this.status === 'ended') {
      return
    }

    m.reply({
      embeds: [
        new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle(`[天亮了]: 第 ${this.dayCount} 天`)
          .setDescription(
            `昨晚${
              deadTags.length
                ? `死的是:\n${deadTags.join('\n')}\n\n${
                    hasDeathMessages.length
                      ? `以下玩家請發表遺言:\n${hasDeathMessages.join('\n')}`
                      : '以上玩家皆未能發表遺言'
                  }`
                : '是平安夜'
            }`
          )
          .setFooter(`Game Id:${this.id}`)
          .setColor(client.colors.yellow)
      ],
      components: [
        new Discord.MessageActionRow().addComponents(
          new Discord.MessageButton()
            .setCustomId('startDiscussion')
            .setLabel('開始討論')
            .setStyle('SUCCESS')
        )
      ]
    })

    this.dayCount++
    Util.printLog('INFO', __filename, `New Day Count: ${this.dayCount}`)
  }

  witchComponents () {
    const toBeKilledId = this[`day${this.dayCount}kill`]
    const toBeKilled = this.readableRoles.find(
      player => player.user.id === toBeKilledId
    )
    let options = [
      {
        label: `救 [${toBeKilled.identifier}]${toBeKilled.user.tag}`,
        description: '使用 藥 (一局僅限一次)',
        value: 'witchSave'
      }
    ]
    const witch = this.readableRoles.find(player => player.role === '女巫')
    if (toBeKilledId === witch.user.id) options = []
    if (this.witchOptions.help === 0) options = []
    options.push({
      label: '跳過一輪',
      description: '不使用藥或毒藥 (如有剩下,可留待之後使用)',
      value: 'witchSkip'
    })
    if (this.witchOptions.kill > 0) {
      const alivePlayers = this.readableRoles.filter(
        player => player.role !== '女巫' && player.alive
      )
      for (const player of alivePlayers) {
        options.push({
          label: `毒 [${player.identifier}]${player.user.tag}`,
          description: '使用 毒藥 (一局僅限一次)',
          value: player.user.id
        })
      }
    }

    const actionRow = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId('witchAction')
        .setPlaceholder('選擇...')
        .addOptions(options)
    )
    return [actionRow]
  }

  playerTargetSelector (
    role,
    readableActionText,
    filter = player => player.alive
  ) {
    const playerOptions = []
    let alivePlayers
    if (!filter) {
      alivePlayers = this.readableRoles.filter(player => player.alive)
    }
    if (filter) alivePlayers = this.readableRoles.filter(filter)
    for (const player of alivePlayers) {
      playerOptions.push({
        label: player.user.tag,
        description: `${readableActionText} [${player.identifier}]${player.user.username}`,
        value: player.user.id
      })
    }
    const actionRow = new Discord.MessageActionRow().addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId(`${role}Action`)
        .setPlaceholder(`選擇要${readableActionText}的玩家...`)
        .addOptions(playerOptions)
    )
    return [actionRow]
  }

  startDiscussion (interaction) {
    let sortedPlayersList = ''
    const aliveRoles = this.readableRoles.filter(player => player.alive)
    aliveRoles.forEach(player => {
      sortedPlayersList += `\n> ${player.identifier}. <@${player.user.id}>`
    })
    interaction.message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle('討論環節')
          .setDescription(`發言次序: ${sortedPlayersList}`)
          .setColor(client.colors.green)
          .setFooter(`Game Id:${this.id}`)
      ],
      components: [
        new Discord.MessageActionRow().addComponents(
          new Discord.MessageButton()
            .setCustomId('startVote')
            .setLabel('開始投票')
            .setStyle('SUCCESS')
        )
      ]
    })
  }

  async startVote (interaction) {
    this[`day${this.dayCount}vote`] = []
    const aliveRoles = this.readableRoles.filter(player => player.alive)
    for (const player of aliveRoles) {
      this[`day${this.dayCount}vote`].push([
        player.user.id,
        `[${player.identifier}] <@${player.user.id}>`,
        '正在等候投票'
      ])
    }
    interaction.message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle('投票環節')
          .setDescription('請選出要投的玩家')
          .setColor(client.colors.red)
          .setFooter(`Game Id:${this.id}`)
      ],
      components: this.playerTargetSelector('vote', '投票')
    })
    this[
      `day${this.dayCount}votePanel`
    ] = await interaction.message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle('投票結果')
          .setDescription(
            MafiaGame.formatVoteResults(this[`day${this.dayCount}vote`])
          )
          .setColor(client.colors.red)
          .setFooter(`Game Id:${this.id}`)
      ]
    })
  }

  handleVote (interaction) {
    const u = interaction.user
    const gameU = this.readableRoles.find(p => p.user.id === u.id)
    Util.printLog('INFO', __filename, `received vote from: ${gameU}`)

    if (!gameU.alive) return
    const i = this[`day${this.dayCount}vote`].findIndex(
      item => item[0] === u.id
    )
    if (this[`day${this.dayCount}vote`][i][2] === '正在等候投票') {
      this[`day${this.dayCount}vote`][
        i
      ][2] = `投給了 <@${interaction.values?.[0]}>`
    }
    Util.printLog(
      'INFO',
      __filename,
      `updated votes of the day: ${this[`day${this.dayCount}vote`]}`
    )
    this[`day${this.dayCount}votePanel`].edit({
      embeds: [
        new Discord.MessageEmbed()
          .setAuthor({
            name: `主持: ${this.host.tag}`,
            iconURL: this.host.displayAvatarURL()
          })
          .setTitle('投票結果')
          .setDescription(
            MafiaGame.formatVoteResults(this[`day${this.dayCount}vote`])
          )
          .setColor(client.colors.red)
          .setFooter(`Game Id:${this.id}`)
      ]
    })

    const x = this[`day${this.dayCount}vote`].findIndex(
      item => item[2] === '正在等候投票'
    )
    // x is -1 when everyone voted
    if (x === -1) {
      Util.printLog('INFO', __filename, 'Now processing votes')
      const y = MafiaGame.calculateVote(this[`day${this.dayCount}vote`])
      Util.printLog('INFO', __filename, `Calculated votes: ${y}`)
      if (y.length === 1) {
        Util.printLog('INFO', __filename, `Player died by voting: ${y[0]}`)
        this.voteKill(y[0])
      } else {
        Util.printLog('INFO', __filename, 'No one died by voting')
        this[`day${this.dayCount}votePanel`].reply({
          embeds: [
            new Discord.MessageEmbed()
              .setAuthor({
                name: `主持: ${this.host.tag}`,
                iconURL: this.host.displayAvatarURL()
              })
              .setTitle(`第${this.dayCount}天 投票結果`)
              .setDescription('由於出現了平票, 沒有人被票死')
              .setFooter(`Game Id:${this.id}`)
              .setColor(client.colors.red)
          ]
        })
      }
    }
  }

  checkOver () {
    const wolfCount = this.readableRoles.filter(
      player => player.alive && player.role === '狼人'
    ).length
    const innocentCount = this.readableRoles.filter(
      player => player.alive && player.role === '平民'
    ).length
    const witchCount = this.readableRoles.filter(
      player => player.alive && player.role === '女巫'
    ).length
    const guardCount = this.readableRoles.filter(
      player => player.alive && player.role === '守衛'
    ).length
    const hunterCount = this.readableRoles.filter(
      player => player.alive && player.role === '獵人'
    ).length
    const specialCharsCount = witchCount + guardCount + hunterCount

    switch (true) {
      case wolfCount > innocentCount + specialCharsCount:
        this.status = 'ended'
        this.endGame('wolfMore')
        break
      case wolfCount === innocentCount && specialCharsCount === 0:
        this.status = 'ended'
        this.endGame('equal')
        break
      case wolfCount === 0:
        this.status = 'ended'
        this.endGame('innocent')
        break
    }
  }

  endGame (reason) {
    this.status = 'ended'
    this.message.reply({ embeds: [this.getEndEmbed(reason)] })
  }

  getEndEmbed (reason) {
    const reasons = {
      wolfMore: '狼人數量多於好人方數量',
      equal: '狼人數量和平民數量相同',
      innocent: '全部狼人已死亡，'
    }
    const winner = {
      wolfMore: '狼人',
      equal: '狼人',
      innocent: '好人'
    }
    const sortedRoles = Util.sortArrayOfObjects(this.readableRoles)
    const rolesListStrings = []
    for (const player of sortedRoles) {
      rolesListStrings.push(`${player.user.tag} - ${player.role}`)
    }
    const embed = new Discord.MessageEmbed()
      .setTitle('狼人殺 - 遊戲結束')
      .setDescription(
        `${reasons[reason]}，遊戲已結束，${
          winner[reason]
        }方勝利。\n本局角色如下:\n${rolesListStrings.join('\n')}`
      )
      .setAuthor({
        name: `主持: ${this.host.tag}`,
        iconURL: this.host.displayAvatarURL()
      })
      .setFooter(`Game Id:${this.id}`)
      .setColor(client.colors.green)
    return embed
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
    let sortedPlayersList = ''
    this.readableRoles.forEach(player => {
      sortedPlayersList += `\n> ${player.identifier}. <@${player.user.id}>`
    })
    return new Discord.MessageEmbed()
      .setTitle('狼人殺 - 已分配角色')
      .setDescription(
        `請查看你的私訊並等待主持開始\n**玩家**${sortedPlayersList}\n\n**角色**\n> ${this.roleSettings.wolf} 狼人 \n> ${this.roleSettings.detective} 預言 \n> ${this.roleSettings.witch} 女巫 \n> ${this.roleSettings.hunter} 獵人 \n> ${this.roleSettings.guard} 守衛 \n> ${this.roleSettings.none} 平民`
      )
      .setAuthor({
        name: `主持: ${this.host.tag}`,
        iconURL: this.host.displayAvatarURL()
      })
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
        .setAuthor({
          name: `主持: ${this.host.tag || '???'}`,
          iconURL: this.host.avatarURL || undefined
        })
        .setDescription('遊戲已取消')
        .setColor(client.colors.red)
        .setFooter(`Game Id:${this.id || 'Unknown'}`),
      guardAction: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag || '???'}`,
          iconURL: this.host.avatarURL || undefined
        })
        .setTitle(`守衛 [遊戲進度: 第${this.dayCount}晚]`)
        .setDescription('請選擇你要守護的玩家')
        .setColor(client.colors.green)
        .setFooter(`Game Id:${this.id || 'Unknown'}`),
      detectiveAction: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag || '???'}`,
          iconURL: this.host.avatarURL || undefined
        })
        .setTitle(`預言家 [遊戲進度: 第${this.dayCount}晚]`)
        .setDescription('請選擇你要檢查身分的玩家')
        .setColor(client.colors.green)
        .setFooter(`Game Id:${this.id || 'Unknown'}`),
      wolfAction: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag || '???'}`,
          iconURL: this.host.avatarURL || undefined
        })
        .setTitle(`狼人 [遊戲進度: 第${this.dayCount}晚]`)
        .setDescription('請選擇你要殺的玩家')
        .setColor(client.colors.green)
        .setFooter(`Game Id:${this.id || 'Unknown'}`),
      witchAction: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag || '???'}`,
          iconURL: this.host.avatarURL || undefined
        })
        .setTitle(`女巫 [遊戲進度: 第${this.dayCount}晚]`)
        .setColor(client.colors.green)
        .setFooter(`Game Id:${this.id || 'Unknown'}`),
      waitingGuard: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag}`,
          iconURL: this.host.displayAvatarURL()
        })
        .setTitle(`第 ${this.dayCount} 天 - 晚上`)
        .setDescription('> 守衛請睜眼\n請查看你的私訊以進行角色行動')
        .setColor(client.colors.blue),
      waitingDetective: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag}`,
          iconURL: this.host.displayAvatarURL()
        })
        .setTitle(`第 ${this.dayCount} 天 - 晚上`)
        .setDescription(
          `> ${
            this.roleSettings.guard > 0 ? '守衛請閉眼,' : ''
          }預言家請睜眼\n請查看你的私訊以進行角色行動`
        )
        .setColor(client.colors.blue),
      waitingWolf: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag}`,
          iconURL: this.host.displayAvatarURL()
        })
        .setTitle(`第 ${this.dayCount} 天 - 晚上`)
        .setDescription(
          `> ${
            this.roleSettings.detective > 0
              ? '預言家請閉眼,'
              : this.roleSettings.guard > 0
              ? '守衛請閉眼,'
              : ''
          }狼人請睜眼\n請查看你的私訊以進行角色行動`
        )
        .setColor(client.colors.blue),
      waitingWitch: new Discord.MessageEmbed()
        .setAuthor({
          name: `主持: ${this.host.tag}`,
          iconURL: this.host.displayAvatarURL()
        })
        .setTitle(`第 ${this.dayCount} 天 - 晚上`)
        .setDescription('> 狼人請閉眼,女巫請睜眼\n請查看你的私訊以進行角色行動')
        .setColor(client.colors.blue)
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

  static findByUser (user) {
    const targetGame = games.find(game => game.host?.id === user.id)
    return targetGame || false
  }

  static formatVoteResults (votes) {
    let results = ''
    for (const [, user, vote] of votes) {
      results += `\n${user}\n-> ${vote}\n\n`
    }
    return results
  }

  static calculateVote (votes) {
    const tempR = []
    for (const [, , voteU] of votes) {
      tempR.push(voteU)
    }
    const result = getMostFrequent(tempR)
    return result
  }

  static checkGameOver (game) {}
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

      case 'startNight':
        if (MafiaGame.findByUser(message.author)) {
          MafiaGame.findByUser(message.author).startNight(message)
        }
        break

      case 'cmd':
      default:
        message.reply({ embeds: [new ReplyEmbeds(client).commands] })
        break
    }
  }

  static async handleInteraction (interaction) {
    const menuMessage = interaction.message
    const gameEmbed = menuMessage.embeds?.[0]
    const gameId = (gameEmbed?.footer?.text).split(':')[1]
    const game = games.find(g => g.id === gameId)
    if (!game) throw new Error()
    game.registerRolesCount(interaction)
  }

  static async handleRoleAction (interaction) {
    const menuMessage = interaction.message
    const gameEmbed = menuMessage.embeds?.[0]
    const action = interaction.customId.replace('Action', '')
    const target = interaction.values?.[0]
    const gameId = (gameEmbed?.footer?.text).split(':')[1].replace(' ', '')
    const game = games.find(g => g.id === gameId)
    menuMessage.delete()
    switch (action) {
      case 'guard':
        game.handleGuardAction(game, target)
        break
      case 'detective':
        game.handleDetectiveAction(game, target)
        break
      case 'wolf':
        game.handleWolfAction(game, target)
        break
      case 'witch':
        game.handleWitchAction(game, target)
        break
    }
  }

  static startDiscussion (interaction) {
    const message = interaction.message
    const gameEmbed = message.embeds?.[0]
    const gameId = (gameEmbed?.footer?.text).split(':')[1].replace(' ', '')
    const game = games.find(g => g.id === gameId)
    game.startDiscussion(interaction)
  }

  static startVote (interaction) {
    const message = interaction.message
    const gameEmbed = message.embeds?.[0]
    const gameId = (gameEmbed?.footer?.text).split(':')[1].replace(' ', '')
    const game = games.find(g => g.id === gameId)
    game.startVote(interaction)
  }

  static handleVote (interaction) {
    const message = interaction.message
    const gameEmbed = message.embeds?.[0]
    const gameId = (gameEmbed?.footer?.text).split(':')[1].replace(' ', '')
    const game = games.find(g => g.id === gameId)
    game.handleVote(interaction)
  }
}

function getMostFrequent (array) {
  if (array.length === 0) return null
  const modeMap = {}
  let maxCount = 1
  let modes = []

  for (let i = 0; i < array.length; i++) {
    const el = array[i]

    if (modeMap[el] == null) modeMap[el] = 1
    else modeMap[el]++

    if (modeMap[el] > maxCount) {
      modes = [el]
      maxCount = modeMap[el]
    } else if (modeMap[el] === maxCount) {
      modes.push(el)
      maxCount = modeMap[el]
    }
  }
  return modes
}
