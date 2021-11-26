const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

module.exports = class ColorCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'color',
      aliases: ['c'],
      category: '一般',
      description: '更改暱稱顏色',
      usage: 'c <color>',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {
    const rolesCache = message.guild.roles.cache
    const pink = rolesCache.find(role => role.name === 'pink')
    const hotpink = rolesCache.find(role => role.name === 'hotpink')
    const red = rolesCache.find(role => role.name === 'red')
    const orange = rolesCache.find(role => role.name === 'orange')
    const yellow = rolesCache.find(role => role.name === 'yellow')
    const lime = rolesCache.find(role => role.name === 'lime')
    const green = rolesCache.find(role => role.name === 'green')
    const cyan = rolesCache.find(role => role.name === 'cyan')
    const aqua = rolesCache.find(role => role.name === 'aqua')
    const blue = rolesCache.find(role => role.name === 'blue')
    const purple = rolesCache.find(role => role.name === 'purple')
    const jane = rolesCache.find(role => role.name === 'jane')
    const amber = rolesCache.find(role => role.name === 'amber')
    const cornflower = rolesCache.find(role => role.name === 'cornflower')
    const black = rolesCache.find(role => role.name === 'black')
    const invisible = rolesCache.find(role => role.name === 'invisible')
    const tyl = rolesCache.find(role => role.name === '天依藍')
    const zfsnf = rolesCache.find(role => role.name === '制服少女粉')

    const colors = [tyl, zfsnf, pink, hotpink, red, orange, amber, yellow, lime, green, cyan, aqua, blue, cornflower, purple, jane, black, invisible]
    const rlist = ['天依藍', '制服少女粉', 'pink', 'hotpink', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'cyan', 'aqua', 'blue', 'cornflower', 'purple', 'jane', 'black', 'invisible']

    const g = message.guild

    const mem = message.member

    if (args[0] && (!(isNaN(args[0]))) && (args[0] < 20)) {
      args[0] = rlist[Number(args[0]) - 1]
    }

    if (!args[0]) {
      let readList = ''
      for (let i5 = 0; i5 < colors.length; i5++) {
        if (colors[i5]) {
          readList += `${i5 + 1}) <@&${colors[i5].id}>\n`
        }
      }
      return message.reply(Util.InfoEmbed(message, '請在指令後輸入想要換成的暱稱顏色', `可選的顏色:\n${readList}`))
    }

    async function fail () {
      if (args[0].toLowerCase() === 'white') {
        return white()
      }
      message.reply(`簡不能把你的名稱顏色改成 ${args[0]} 。`)
    }

    async function sucess (w, c) {
      if (!w) return
      const sucessEmbed = new Discord.MessageEmbed()
        .setColor(c)
        .setDescription(`:white_check_mark: 簡已經把你的名稱顏色改成 ${w}`)
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
      message.reply({embeds: [sucessEmbed]})
    }

    let nowrole
    async function white () {
      let now
      for (now = 0; now < colors.length; now++) {
        nowrole = colors[now]
        if (mem.roles.cache.has(nowrole.id)) mem.roles.remove(nowrole.id)
      }
      sucess()
    }

    if (!rlist.includes(args[0])) return fail()

    let now2, now2role
    for (now2 = 0; now2 < colors.length; now2++) {
      now2role = colors[now2]
      if (now2role) {
        Util.printLog('info', __filename, `Mem Role Cache includes now2role: ${mem.roles.cache.has(now2role)}`)
        if (mem.roles.cache.has(now2role.id)) mem.roles.remove(now2role.id)
      }
    }

    try {
      const r = rolesCache.find(role => role.name === args[0].toLowerCase())
      if (r === null) return fail()
      g.member(message.author).roles.add(r)
      sucess(args[0], r.hexColor)
    } catch (e) {
      Util.printLog('err', __filename, e)
      Util.handleErr(e)
    }
  }
}
