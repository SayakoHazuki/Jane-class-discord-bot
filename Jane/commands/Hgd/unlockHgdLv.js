const Discord = require('discord.js')
const Util = require('utils')
const Command = require('cmd')

module.exports = class HgdUnlockLvCommand extends Command {
  constructor (client) {
    super(client, {
      name: '解鎖好感度等級',
      aliases: ['解放好感度等級'],
      category: '好感度',
      description: '解鎖好感度等級',
      usage: '解鎖好感度等級',
      minArgs: 0,
      maxArgs: -1
    })
  }

  async run (message, args) {}
}
