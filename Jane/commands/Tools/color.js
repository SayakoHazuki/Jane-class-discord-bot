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
    const colors = [
      '天依藍',
      '制服少女粉',
      'pink',
      'hotpink',
      'red',
      'orange',
      'amber',
      'yellow',
      'lime',
      'green',
      'cyan',
      'aqua',
      'blue',
      'cornflower',
      'purple',
      'jane',
      'black',
      'invisible'
    ]
    const rolesCache = message.guild.roles.cache
    const colorRoles = []

    for (const color of colors) {
      colorRoles.push(rolesCache.find(role => role.name === color) ?? undefined)
    }

    if (args[0] && !isNaN(args[0]) && args[0] < 20) {
      const role = colorRoles.filter(role => role).map(role => role.name)[
        Number(args[0] - 1)
      ]
      if (!role) return message.reply(`沒有此選項: ${args[0]}`)
      args[0] = role
    }

    if (!args[0]) {
      let colorRolesList = ''
      for (let i = 0; i < colors.length; i++) {
        if (!colorRoles[i]) continue
        colorRolesList += `${(colorRoles
          .filter(role => role)
          .map(role => role.name)
          .indexOf(colors[i]) ?? -1) + 1 || undefined}) <@&${
          colorRoles[i].id
        }>\n`
      }
      return message.reply(
        Util.InfoEmbed(
          message,
          '請在指令後輸入想要換成的暱稱顏色',
          `可選的顏色:\n${colorRolesList}`
        )
      )
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
      message.reply({ embeds: [sucessEmbed] })
    }

    async function white () {
      for (let i = 0; i < colors.length; i++) {
        const role = colors[i]
        if (message.member.roles.cache.has(role.id)) {
          message.member.roles.remove(role.id)
        }
      }
      sucess('white', '#fff')
    }

    if (!colors.includes(args[0])) return fail()

    for (let i = 0; i < colors.length; i++) {
      const role = colors[i]
      if (!role) continue
      if (message.member.roles.cache.has(role.id)) {
        message.member.roles.remove(role.id)
      }
    }

    try {
      const r = rolesCache.find(role => role.name === args[0].toLowerCase())
      if (r === null) return fail()
      message.member.roles.add(r)
      sucess(args[0], r.hexColor)
    } catch (e) {
      return message.reply('更改暱稱顏色時發生了一個錯誤')
    }
  }
}
