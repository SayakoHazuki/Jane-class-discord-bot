const Evt = require('../core/e')
const MafiaMenuHandler = require('../commands/Games/interactionHandler')

module.exports = class interactionCreate extends Evt {
  constructor (client) {
    super(client, 'interactionCreate')
  }

  async run (interaction) {
    switch (true) {
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
