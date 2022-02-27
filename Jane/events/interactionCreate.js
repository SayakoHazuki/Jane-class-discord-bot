const Evt = require('../core/e')
const MafiaMenuHandler = require('../commands/Games/interactionHandler')
const hgdUtil = require('hgdUtils')

module.exports = class interactionCreate extends Evt {
  constructor (client) {
    super(client, 'interactionCreate')
  }

  async run (interaction) {
    switch (true) {
      case interaction.customId === 'unlockHighLv':
        hgdUtil.unlockHighLv(interaction)
        break
      case interaction.isSelectMenu():
        interaction.deferUpdate()
        MafiaMenuHandler.handleMafiaInteraction(interaction)
        break
      default:
        interaction.deferUpdate()
        MafiaMenuHandler.handleMafiaButton(interaction)
        break
    }
  }
}
