const Evt = require('../core/e')
const MafiaMenuHandler = require('../commands/Games/interactionHandler')

module.exports = class interactionCreate extends Evt {
  constructor (client) {
    super(client, 'interactionCreate')
  }

  async run (interaction) {
    switch (true) {
      case interaction.isSelectMenu():
        if (
          [
            'wolfCount',
            'detectiveCount',
            'witchCount',
            'hunterCount',
            'guardCount'
          ].includes(interaction.customId)
        ) {
          interaction.deferUpdate()
          return MafiaMenuHandler.handleMafiaInteraction(interaction)
        }
        break
    }
  }
}
