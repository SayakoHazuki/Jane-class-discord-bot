const Evt = require('../core/e')
const MafiaMenuHandler = require('../core/MafiaInteractions')
const hgdUtil = require('hgdUtils')

module.exports = class interactionCreate extends Evt {
  constructor (client) {
    super(client, 'interactionCreate')
  }

  async run (interaction) {
    function runHgdCmd (cmds, interaction) {
      const command = cmds.find(
        cmd => cmd.code === interaction.customId.split(':')[1]
      )
      if (!command) return
      command.run(interaction)
    }

    switch (true) {
      case interaction.customId === 'unlockHighLv':
        hgdUtil.unlockHighLv(interaction)
        break
      case interaction.customId.startsWith('hgd-run:'):
        runHgdCmd(this.client.commands, interaction)
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
