const Evt = require('../core/e')
const MafiaMenuHandler = require('../core/MafiaInteractions')
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
      case MafiaMenuHandler.interactions.includes(interaction.customId):
        interaction.deferUpdate()
        if (interaction.isSelectMenu()) {
          MafiaMenuHandler.handleMafiaInteraction(interaction)
        } else {
          MafiaMenuHandler.handleMafiaButton(interaction)
        }
    }
  }
}
